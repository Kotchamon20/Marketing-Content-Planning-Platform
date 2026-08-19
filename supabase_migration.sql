-- ============================================================
-- Nitan Content Platform — Supabase Migration Script
-- รันใน Supabase SQL Editor ทีเดียว (Idempotent / ปลอดภัยถ้ารันซ้ำ)
-- ============================================================

-- 1. เพิ่ม column ที่ขาดหายไปใน content_items
ALTER TABLE content_items ADD COLUMN IF NOT EXISTS visual_concept    TEXT;
ALTER TABLE content_items ADD COLUMN IF NOT EXISTS reference_url     VARCHAR(512);
ALTER TABLE content_items ADD COLUMN IF NOT EXISTS content_group     VARCHAR(200);
ALTER TABLE content_items ADD COLUMN IF NOT EXISTS group_name        TEXT;
ALTER TABLE content_items ADD COLUMN IF NOT EXISTS sub_category      TEXT;
ALTER TABLE content_items ADD COLUMN IF NOT EXISTS media_url         VARCHAR(512);

-- 2. เปลี่ยน platform column ให้รับ TEXT ได้ (ไม่ต้อง ENUM เพื่อความยืดหยุ่น)
ALTER TABLE content_items ALTER COLUMN platform TYPE TEXT USING platform::text;

-- 3. ปิด RLS ทั้งหมดสำหรับ content_items (allow public read/write)
ALTER TABLE content_items DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public all access on content_items" ON content_items;

-- 4. เปิด Realtime สำหรับ content_items
ALTER PUBLICATION supabase_realtime ADD TABLE content_items;

-- 5. ตรวจสอบผลลัพธ์ (Optional: ดู column ที่มีอยู่)
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'content_items'
ORDER BY ordinal_position;
