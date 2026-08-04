-- ============================================================
-- pg_cron + Edge Function Trigger Setup
-- Run this SQL in the Supabase Dashboard → SQL Editor
-- ============================================================

-- Enable pg_cron (requires Supabase Pro or above; already on most plans)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;   -- for HTTP calls from cron

-- Grant cron to postgres role
GRANT USAGE ON SCHEMA cron TO postgres;

-- Schedule the SMS Edge Function to run every 15 minutes
-- Adjust SUPABASE_URL to your project's URL
SELECT cron.schedule(
  'send-sms-reminders',        -- job name (unique)
  '*/15 * * * *',              -- every 15 minutes
  $$
  SELECT net.http_post(
    url     := 'https://jlyembaddiyakxuvaflq.supabase.co/functions/v1/send-sms-reminders',
    headers := jsonb_build_object(
      'Content-Type',   'application/json',
      'Authorization',  'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpseWVtYmFkZGl5YWt4dXZhZmxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxODg3NzEsImV4cCI6MjA5Nzc2NDc3MX0.ffmK3h29al3O7PksBWXzdjEoy7TbnLOmkUSHMatq1P0'
    ),
    body    := '{}'::jsonb
  ) AS request_id;
  $$
);

-- To view scheduled jobs:
-- SELECT * FROM cron.job;

-- To remove the job:
-- SELECT cron.unschedule('send-sms-reminders');
