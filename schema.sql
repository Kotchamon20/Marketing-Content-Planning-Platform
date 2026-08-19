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
    customer_journey JSONB DEFAULT '{}',
    total_budget DECIMAL(12, 2) DEFAULT 0.00,
    budget_channels JSONB DEFAULT '{}',
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
    offset_days INTEGER NOT NULL,
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

-- 12. LINE GROUPS (Auto-Captured LINE Group IDs)
CREATE TABLE IF NOT EXISTS line_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id TEXT NOT NULL UNIQUE,
    group_name TEXT DEFAULT 'Nitan Line Group',
    is_active BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. BRANCH BUDGETS (Module 3 - Branch Allocation Cards & Google Breakdown)
CREATE TABLE IF NOT EXISTS branch_budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_name VARCHAR(255) NOT NULL,
    month_year VARCHAR(20) NOT NULL,
    previous_sales DECIMAL(12, 2) DEFAULT 0.00,
    mkt_percent DECIMAL(5, 2) DEFAULT 2.00,
    full_budget DECIMAL(12, 2) DEFAULT 0.00,
    offline_promotions JSONB DEFAULT '[]',
    channel_allocations JSONB DEFAULT '[]',
    google_search_breakdown JSONB DEFAULT '{}',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. TODO TASKS (Module 5 - Priority Tasks & Work Followup)
CREATE TABLE IF NOT EXISTS todo_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    due_date DATE,
    priority VARCHAR(20) DEFAULT 'medium',
    assigned_to VARCHAR(100) DEFAULT 'Marketing Team',
    status VARCHAR(20) DEFAULT 'pending',
    category VARCHAR(50) DEFAULT 'general',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 15. KPI ITEMS & PAID ADS (Module 6 - Performance & Paid Spend)
CREATE TABLE IF NOT EXISTS kpi_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) DEFAULT 'shopee',
    sub_group VARCHAR(100) DEFAULT 'Shopee Official Store',
    target_revenue DECIMAL(12, 2) DEFAULT 0.00,
    actual_revenue DECIMAL(12, 2) DEFAULT 0.00,
    orders_count INTEGER DEFAULT 0,
    roas DECIMAL(6, 2) DEFAULT 0.00,
    cpa DECIMAL(10, 2) DEFAULT 0.00,
    is_ads_running BOOLEAN DEFAULT FALSE,
    ads_budget DECIMAL(12, 2) DEFAULT 0.00,
    actual_ads_spend DECIMAL(12, 2) DEFAULT 0.00,
    ads_channel VARCHAR(255) DEFAULT 'Online Ads',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 16. PROMOTION PLANS (Module 4 - Related Product Promotion Plans)
CREATE TABLE IF NOT EXISTS promotion_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) DEFAULT 'discount',
    product_id VARCHAR(100) DEFAULT 'p-1',
    product_name VARCHAR(255) DEFAULT 'สินค้าทุกรายการ',
    discount_text VARCHAR(100),
    start_date DATE,
    end_date DATE,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DISABLE RLS TO ALLOW FULL DIRECT ANONYMOUS READ/WRITE ACCESS FROM LOCAL AND PRODUCTION
ALTER TABLE teams DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_ideas DISABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns DISABLE ROW LEVEL SECURITY;
ALTER TABLE content_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE idea_vault DISABLE ROW LEVEL SECURITY;
ALTER TABLE notification_rules DISABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE line_groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE branch_budgets DISABLE ROW LEVEL SECURITY;
ALTER TABLE todo_tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE promotion_plans DISABLE ROW LEVEL SECURITY;

-- SAFE PUBLIC ALL ACCESS POLICIES
DROP POLICY IF EXISTS "Allow public all access on line_groups" ON line_groups;
CREATE POLICY "Allow public all access on line_groups" ON line_groups FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public all access on branch_budgets" ON branch_budgets;
CREATE POLICY "Allow public all access on branch_budgets" ON branch_budgets FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public all access on todo_tasks" ON todo_tasks;
CREATE POLICY "Allow public all access on todo_tasks" ON todo_tasks FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public all access on kpi_items" ON kpi_items;
CREATE POLICY "Allow public all access on kpi_items" ON kpi_items FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public all access on promotion_plans" ON promotion_plans;
CREATE POLICY "Allow public all access on promotion_plans" ON promotion_plans FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public all access on teams" ON teams;
CREATE POLICY "Allow public all access on teams" ON teams FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public all access on users" ON users;
CREATE POLICY "Allow public all access on users" ON users FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public all access on products" ON products;
CREATE POLICY "Allow public all access on products" ON products FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public all access on marketing_plans" ON marketing_plans;
CREATE POLICY "Allow public all access on marketing_plans" ON marketing_plans FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public all access on campaign_ideas" ON campaign_ideas;
CREATE POLICY "Allow public all access on campaign_ideas" ON campaign_ideas FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public all access on campaigns" ON campaigns;
CREATE POLICY "Allow public all access on campaigns" ON campaigns FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public all access on content_items" ON content_items;
CREATE POLICY "Allow public all access on content_items" ON content_items FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public all access on idea_vault" ON idea_vault;
CREATE POLICY "Allow public all access on idea_vault" ON idea_vault FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public all access on notification_rules" ON notification_rules;
CREATE POLICY "Allow public all access on notification_rules" ON notification_rules FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public all access on notification_logs" ON notification_logs;
CREATE POLICY "Allow public all access on notification_logs" ON notification_logs FOR ALL USING (true);
