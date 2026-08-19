-- ==============================================
-- Nitan CRM - Supabase pg_cron Setup
-- ==============================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Schedule 9 AM (02:00 UTC) Content Notifications
SELECT cron.schedule(
  'daily-notifications-9am',
  '0 2 * * *', -- Runs every day at 02:00 UTC (09:00 BKK)
  $$
  SELECT net.http_post(
      url:='https://wgwvvahdtdxcfoxxvwkm.supabase.co/functions/v1/daily-cron',
      headers:='{"Content-Type": "application/json"}'::jsonb,
      body:='{"time": "9am"}'::jsonb
  );
  $$
);

-- 3. Schedule 10 AM (03:00 UTC) Follow-up Notifications
SELECT cron.schedule(
  'daily-notifications-10am',
  '0 3 * * *', -- Runs every day at 03:00 UTC (10:00 BKK)
  $$
  SELECT net.http_post(
      url:='https://wgwvvahdtdxcfoxxvwkm.supabase.co/functions/v1/daily-cron',
      headers:='{"Content-Type": "application/json"}'::jsonb,
      body:='{"time": "10am"}'::jsonb
  );
  $$
);
