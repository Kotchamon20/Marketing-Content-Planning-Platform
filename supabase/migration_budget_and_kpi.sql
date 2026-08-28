-- ==============================================================================
-- Migration SQL: Add Columns for Note, Campaign Sales, and Budget vs Actual Table
-- Run this in Supabase SQL Editor:
-- ==============================================================================

-- 1. เพิ่ม Note ในตารางการจัดสรรงบประมาณสาขา (Branch Budgets)
ALTER TABLE IF EXISTS branch_budgets 
ADD COLUMN IF NOT EXISTS note TEXT;

-- 2. เพิ่มคอลัมน์ ยอดขายจากแคมเปญ (campaign_sales) และ Note ในตาราง KPI Items
ALTER TABLE IF EXISTS kpi_items 
ADD COLUMN IF NOT EXISTS campaign_sales DECIMAL(12, 2) DEFAULT 0.00;

ALTER TABLE IF EXISTS kpi_items 
ADD COLUMN IF NOT EXISTS note TEXT;

-- 3. สร้างตารางใหม่สำหรับ บันทึกงบประมาณใช้จริง (Budget vs Actual Expenses Ledger)
CREATE TABLE IF NOT EXISTS budget_actual_expenses (
    id VARCHAR(100) PRIMARY KEY,
    month_year VARCHAR(20) NOT NULL,
    date VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL,
    branch_id VARCHAR(50),
    branch_name VARCHAR(255),
    channel VARCHAR(100),
    actual_amount DECIMAL(12, 2) DEFAULT 0.00,
    allocated_budget DECIMAL(12, 2) DEFAULT 0.00,
    payer VARCHAR(100),
    receipt_ref VARCHAR(100),
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. ปิด RLS เพื่อให้ Frontend สามารถอ่าน/บันทึกข้อมูลได้อย่างราบรื่น
ALTER TABLE budget_actual_expenses DISABLE ROW LEVEL SECURITY;

-- หรือหากเปิด RLS ให้ใช้ Policy อนุญาตเข้าถึงได้:
DROP POLICY IF EXISTS "Allow public all access on budget_actual_expenses" ON budget_actual_expenses;
CREATE POLICY "Allow public all access on budget_actual_expenses" ON budget_actual_expenses FOR ALL USING (true);
