
-- Create function to clean up old production data (older than 7 days)
CREATE OR REPLACE FUNCTION cleanup_old_production_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete production report entries older than 7 days
  DELETE FROM public.production_report_entries 
  WHERE report_id IN (
    SELECT id FROM public.production_reports 
    WHERE report_date < CURRENT_DATE - INTERVAL '7 days'
  );
  
  -- Delete production reports older than 7 days
  DELETE FROM public.production_reports 
  WHERE report_date < CURRENT_DATE - INTERVAL '7 days';
  
  -- Delete related activity discrepancies older than 7 days
  DELETE FROM public.activity_discrepancies 
  WHERE report_date < CURRENT_DATE - INTERVAL '7 days';
  
  RAISE NOTICE 'Cleaned up production data older than 7 days';
END;
$$;

-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the cleanup function to run every 7 days at 2 AM
SELECT cron.schedule(
  'cleanup-old-production-data',
  '0 2 */7 * *', -- At 2:00 AM every 7 days
  'SELECT cleanup_old_production_data();'
);
