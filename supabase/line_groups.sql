-- ==============================================================================
-- Supabase line_groups table for storing auto-captured LINE Group IDs
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.line_groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id TEXT NOT NULL UNIQUE,
    group_name TEXT DEFAULT 'Nitan Line Group',
    joined_at TIMESTAMPTZ DEFAULT now(),
    is_active BOOLEAN DEFAULT true,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS and public access policies
ALTER TABLE public.line_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to line_groups" ON public.line_groups
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert/update to line_groups" ON public.line_groups
    FOR ALL USING (true);
