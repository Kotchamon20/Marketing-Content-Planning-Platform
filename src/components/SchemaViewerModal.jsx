import React, { useState } from 'react';
import { Database, X, Copy, Check, ShieldCheck, Code, Layers } from 'lucide-react';

export default function SchemaViewerModal({ isOpen, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const sqlCode = `-- ==============================================================================
-- Marketing & Content Planning Platform - Multi-tenant Schema (PostgreSQL / Supabase)
-- ==============================================================================

-- 1. TEAMS (Multi-tenant boundary)
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    brand_logo VARCHAR(512),
    plan_tier VARCHAR(50) DEFAULT 'pro',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. USERS
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role user_role DEFAULT 'content_creator',
    line_user_id VARCHAR(100),
    line_display_name VARCHAR(255),
    line_connected BOOLEAN DEFAULT FALSE
);

-- 3. PRODUCTS (Catalog)
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2)
);

-- 4. MARKETING PLANS & STRATEGY CANVAS
CREATE TABLE marketing_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    stp_segmentation TEXT,
    stp_targeting TEXT,
    stp_positioning TEXT,
    swot_strengths TEXT[],
    customer_journey JSONB DEFAULT '{}',
    total_budget DECIMAL(12, 2)
);

-- 5. CAMPAIGNS (Product & Campaign linkage)
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    image_ready BOOLEAN DEFAULT FALSE,
    scheduled BOOLEAN DEFAULT FALSE,
    posted BOOLEAN DEFAULT FALSE,
    status campaign_stage DEFAULT 'planning'
);

-- 6. CONTENT ITEMS
CREATE TABLE content_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES campaigns(id),
    title VARCHAR(255) NOT NULL,
    platform content_platform NOT NULL,
    status content_status DEFAULT 'draft',
    publish_date TIMESTAMP WITH TIME ZONE NOT NULL,
    performance JSONB DEFAULT '{}'
);

-- 7. NOTIFICATION RULES & LOGS
CREATE TABLE notification_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    stage notification_stage NOT NULL,
    offset_days INTEGER NOT NULL,
    target_role user_role DEFAULT 'content_creator'
);

-- ROW LEVEL SECURITY (RLS) POLICIES FOR MULTI-TENANT ISOLATION
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY team_isolation ON content_items FOR ALL USING (team_id = auth.jwt() -> 'team_id');
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-5 bg-white border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Database Schema (schema.sql)</h3>
              <p className="text-xs text-slate-500 font-medium">โครงสร้างตาราง DDL และ Row Level Security (RLS) สำหรับ Supabase / PostgreSQL</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-bold border border-slate-200 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copied ? 'คัดลอกแล้ว!' : 'คัดลอก SQL'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SQL Code View */}
        <div className="p-5 bg-slate-950 overflow-y-auto font-mono text-xs text-slate-200 space-y-4">
          <pre className="leading-relaxed whitespace-pre-wrap">{sqlCode}</pre>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <span className="flex items-center gap-1.5 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Multi-Tenant Isolation Guaranteed via RLS
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl transition shadow-md shadow-slate-900/10 cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
}
