-- ==============================================================================
-- Marketing & Content Planning Platform - Multi-tenant Schema (PostgreSQL / Supabase)
-- Safe & Idempotent Execution Script
-- ==============================================================================

-- 1. ENUMS & TYPES (Safe creation)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN 
        CREATE TYPE user_role AS ENUM ('marketing_lead', 'content_creator', 'brand_owner', 'admin'); 
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'content_platform') THEN 
        CREATE TYPE content_platform AS ENUM ('facebook', 'instagram', 'tiktok', 'line_oa', 'youtube', 'shopee'); 
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'content_status') THEN 
        CREATE TYPE content_status AS ENUM ('draft', 'scheduled', 'published'); 
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'campaign_stage') THEN 
        CREATE TYPE campaign_stage AS ENUM ('idea', 'planning', 'execution', 'completed'); 
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_stage') THEN 
        CREATE TYPE notification_stage AS ENUM ('t_minus_5', 't_minus_2', 't_minus_0', 'overdue'); 
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_status') THEN 
        CREATE TYPE notification_status AS ENUM ('pending', 'sent', 'failed', 'acknowledged'); 
    END IF;
END $$;

-- 2. TEAMS (Multi-tenant boundary)
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    brand_logo VARCHAR(512),
    plan_tier VARCHAR(50) DEFAULT 'pro',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. USERS
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role user_role DEFAULT 'content_creator',
    line_user_id VARCHAR(100),
    line_display_name VARCHAR(255),
    line_connected BOOLEAN DEFAULT FALSE,
    avatar_url VARCHAR(512),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. PRODUCTS (Catalog)
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) NOT NULL,
    category VARCHAR(100),
    price DECIMAL(10, 2),
    image_url VARCHAR(512),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. MARKETING PLANS & STRATEGY CANVAS
CREATE TABLE IF NOT EXISTS marketing_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    objective TEXT,
    stp_segmentation TEXT,
    stp_targeting TEXT,
    stp_positioning TEXT,
    swot_strengths TEXT[],
    swot_weaknesses TEXT[],
    swot_opportunities TEXT[],
    swot_threats TEXT[],
    customer_journey JSONB DEFAULT '{}', -- { awareness: '', consideration: '', conversion: '', loyalty: '' }
    total_budget DECIMAL(12, 2) DEFAULT 0.00,
    budget_channels JSONB DEFAULT '{}', -- { tiktok: 50000, facebook: 30000, instagram: 20000 }
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. CAMPAIGN BRAINSTORM IDEAS
CREATE TABLE IF NOT EXISTS campaign_ideas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    marketing_plan_id UUID REFERENCES marketing_plans(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    suggested_by UUID REFERENCES users(id),
    category VARCHAR(100),
    upvotes INTEGER DEFAULT 0,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. CAMPAIGNS (Product & Campaign linkage)
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    marketing_plan_id UUID REFERENCES marketing_plans(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    budget DECIMAL(12, 2) DEFAULT 0.00,
    revenue_target DECIMAL(12, 2) DEFAULT 0.00,
    actual_revenue DECIMAL(12, 2) DEFAULT 0.00,
    
    -- Preparedness Checklist & Timeline tracking
    image_ready BOOLEAN DEFAULT FALSE,
    scheduled BOOLEAN DEFAULT FALSE,
    posted BOOLEAN DEFAULT FALSE,
    
    status campaign_stage DEFAULT 'planning',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. CONTENT ITEMS (Module 1)
CREATE TABLE IF NOT EXISTS content_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
    creator_id UUID REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    caption TEXT,
    platform content_platform NOT NULL,
    status content_status DEFAULT 'draft',
    publish_date TIMESTAMP WITH TIME ZONE NOT NULL,
    media_url VARCHAR(512),
    reference_url VARCHAR(512),
    content_group VARCHAR(100),
    
    -- Engagement Performance
    performance JSONB DEFAULT '{"views": 0, "likes": 0, "comments": 0, "shares": 0, "ctr": 0.0}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. IDEA VAULT (Module 1 - FR-1.2)
CREATE TABLE IF NOT EXISTS idea_vault (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    notes TEXT,
    platforms content_platform[],
    tags VARCHAR(50)[],
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. NOTIFICATION RULES (Module 4)
CREATE TABLE IF NOT EXISTS notification_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    stage notification_stage NOT NULL,
    offset_days INTEGER NOT NULL, -- e.g. -5 for T-5, -2 for T-2, 0 for T-0, +1 for Overdue
    target_role user_role DEFAULT 'content_creator',
    is_active BOOLEAN DEFAULT TRUE,
    custom_template TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. NOTIFICATION LOGS & ESCALATION (Module 4)
CREATE TABLE IF NOT EXISTS notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    stage notification_stage NOT NULL,
    message TEXT NOT NULL,
    line_flex_json JSONB,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status notification_status DEFAULT 'sent',
    escalation_count INTEGER DEFAULT 0,
    last_escalated_at TIMESTAMP WITH TIME ZONE
);

-- RLS (ROW LEVEL SECURITY) POLICIES FOR MULTI-TENANCY
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE idea_vault ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

-- 12. LINE GROUPS (Auto-Captured LINE Group IDs)
CREATE TABLE IF NOT EXISTS line_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id TEXT NOT NULL UNIQUE,
    group_name TEXT DEFAULT 'Nitan Line Group',
    is_active BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE line_groups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public all access on line_groups" ON line_groups;
CREATE POLICY "Allow public all access on line_groups" ON line_groups FOR ALL USING (true);

