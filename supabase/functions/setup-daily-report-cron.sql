
-- Enable the required extensions for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a cron job to run the daily report function every day at 8:00 AM
SELECT cron.schedule(
  'daily-analytics-report',
  '0 8 * * *', -- Every day at 8:00 AM UTC
  $$
  SELECT
    net.http_post(
        url:='https://naffgvxpxqfhqiopvkwq.supabase.co/functions/v1/daily-report',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hZmZndnhweHFmaHFpb3B2a3dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NjI5MDAsImV4cCI6MjA2NjQzODkwMH0.AvfLVJnNuB29iaaoJSvnmpYLqSaRCmuGt3-JclbEi4s"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);

-- View all scheduled cron jobs (for verification)
-- SELECT * FROM cron.job;

-- To remove the cron job if needed (uncomment if you want to disable):
-- SELECT cron.unschedule('daily-analytics-report');
