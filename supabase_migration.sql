-- ============================================================
-- Nitan Content Platform — All-In-One Complete Setup & Migration
-- คัดลอกข้อความทั้งหมดนี้ ไปวางใน Supabase SQL Editor แล้วกด RUN ได้เลย
-- (คำสั่งทั้งหมดเป็น Idempotent / ปลอดภัยถ้ารันซ้ำ)
-- ============================================================

-- 1. เพิ่ม column ที่จำเป็นสำหรับ content_items
ALTER TABLE content_items ADD COLUMN IF NOT EXISTS visual_concept    TEXT;
ALTER TABLE content_items ADD COLUMN IF NOT EXISTS reference_url     VARCHAR(512);
ALTER TABLE content_items ADD COLUMN IF NOT EXISTS content_group     VARCHAR(200);
ALTER TABLE content_items ADD COLUMN IF NOT EXISTS group_name        TEXT;
ALTER TABLE content_items ADD COLUMN IF NOT EXISTS sub_category      TEXT;
ALTER TABLE content_items ADD COLUMN IF NOT EXISTS media_url         VARCHAR(512);
ALTER TABLE content_items ADD COLUMN IF NOT EXISTS platforms         TEXT[];

-- 2. ปรับเปลี่ยนประเภทข้อมูล platform ให้เป็น TEXT (ยืดหยุ่นรองรับทุกแพลตฟอร์ม)
ALTER TABLE content_items ALTER COLUMN platform TYPE TEXT USING platform::text;

-- 3. ปิด RLS เพื่ออนุญาตให้ทั้ง Local และ Production อ่าน/เขียนข้อมูลได้แบบ Real-time Direct
ALTER TABLE content_items DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public all access on content_items" ON content_items;

-- 4. เปิดใช้งาน Supabase Realtime ให้หน้าเว็บอัปเดตตรงกันทันทีแบบสดๆ
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'content_items'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE content_items;
    END IF;
END $$;

-- 5. ตรวจสอบโครงสร้างตาราง content_items ล่าสุด
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'content_items'
ORDER BY ordinal_position;
-- 18. CONTENT GROUPS (Dynamic Category Setup)
CREATE TABLE IF NOT EXISTS content_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    color_class VARCHAR(100),
    sub_categories TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE content_groups DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public all access on content_groups" ON content_groups;
CREATE POLICY "Allow public all access on content_groups" ON content_groups FOR ALL USING (true);

