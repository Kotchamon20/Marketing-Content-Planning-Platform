import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wgwvvahdtdxcfoxxvwkm.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indnd3Z2YWhkdGR4Y2ZveHh2d2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5NzMyMzcsImV4cCI6MjEwMjU0OTIzN30.2KOSZFWs1osaB07ZUOjC-8SqY-3Jw7TDrHitjJrDS00';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
