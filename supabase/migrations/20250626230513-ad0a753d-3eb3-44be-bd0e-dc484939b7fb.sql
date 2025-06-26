
-- Create a table to store production reports
CREATE TABLE public.production_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  uploaded_by UUID REFERENCES auth.users NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  report_date DATE NOT NULL,
  status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'error')),
  total_records INTEGER DEFAULT 0,
  discrepancies_found INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create a table to store individual employee data from production reports
CREATE TABLE public.production_report_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID REFERENCES public.production_reports(id) ON DELETE CASCADE NOT NULL,
  employee_name TEXT NOT NULL,
  employee_email TEXT,
  user_id UUID REFERENCES auth.users,
  interviews_scheduled INTEGER DEFAULT 0,
  offers_sent INTEGER DEFAULT 0,
  hires_made INTEGER DEFAULT 0,
  candidates_contacted INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create a table to store discrepancies between reports and user entries
CREATE TABLE public.activity_discrepancies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID REFERENCES public.production_reports(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  report_date DATE NOT NULL,
  field_name TEXT NOT NULL, -- interviews_scheduled, offers_sent, etc.
  reported_value INTEGER NOT NULL,
  logged_value INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'corrected')),
  manager_notes TEXT,
  resolved_by UUID REFERENCES auth.users,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.production_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_report_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_discrepancies ENABLE ROW LEVEL SECURITY;

-- Create policies for production reports (management access)
CREATE POLICY "All users can view production reports" 
  ON public.production_reports 
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Users can create production reports" 
  ON public.production_reports 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can update their own production reports" 
  ON public.production_reports 
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = uploaded_by);

-- Create policies for production report entries
CREATE POLICY "All users can view production report entries" 
  ON public.production_report_entries 
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Users can create production report entries" 
  ON public.production_report_entries 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- Create policies for activity discrepancies
CREATE POLICY "Users can view relevant discrepancies" 
  ON public.activity_discrepancies 
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = resolved_by);

CREATE POLICY "Users can create discrepancies" 
  ON public.activity_discrepancies 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update relevant discrepancies" 
  ON public.activity_discrepancies 
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = resolved_by);

-- Create storage bucket for production reports
INSERT INTO storage.buckets (id, name, public) 
VALUES ('production-reports', 'production-reports', false);

-- Create storage policies for production reports
CREATE POLICY "Users can upload production reports" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'production-reports');

CREATE POLICY "Users can view production reports" ON storage.objects
FOR SELECT TO authenticated USING (bucket_id = 'production-reports');

CREATE POLICY "Users can update their own production reports" ON storage.objects
FOR UPDATE TO authenticated USING (bucket_id = 'production-reports' AND owner = auth.uid());

CREATE POLICY "Users can delete their own production reports" ON storage.objects
FOR DELETE TO authenticated USING (bucket_id = 'production-reports' AND owner = auth.uid());

-- Create indexes for better performance
CREATE INDEX idx_production_reports_date ON public.production_reports(report_date);
CREATE INDEX idx_production_report_entries_report_id ON public.production_report_entries(report_id);
CREATE INDEX idx_activity_discrepancies_user_date ON public.activity_discrepancies(user_id, report_date);
CREATE INDEX idx_activity_discrepancies_status ON public.activity_discrepancies(status);
