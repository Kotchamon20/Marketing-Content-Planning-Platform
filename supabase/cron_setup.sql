-- ==============================================================================
-- Supabase Automated Hourly Cron Job for LINE Alerts (pg_cron Setup)
-- Run this in your Supabase SQL Editor to trigger hourly LINE alert scans!
-- ==============================================================================

-- 1. Enable pg_cron and pg_net extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Schedule Hourly Trigger to Call Edge Function
-- Runs at minute 0 of every hour (e.g. 10:00, 11:00, 12:00)
SELECT cron.schedule(
    'hourly-line-alert-cron',
    '0 * * * *',
    $$
    SELECT net.http_post(
        url := 'https://wgwvvahdtdxcfoxxvwkm.supabase.co/functions/v1/line-cron-scheduler',
        headers := '{"Content-Type": "application/json"}'::jsonb,
        body := '{}'::jsonb
    ) AS request_id;
    $$
);
