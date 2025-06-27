
-- Add onboarding_sent column to production_report_entries table
ALTER TABLE production_report_entries 
ADD COLUMN onboarding_sent INTEGER DEFAULT 0;

-- Add onboarding_sent column to activity_logs table  
ALTER TABLE activity_logs 
ADD COLUMN onboarding_sent INTEGER DEFAULT 0;
