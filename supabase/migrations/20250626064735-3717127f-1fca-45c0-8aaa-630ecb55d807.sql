
-- Create a table to store daily activity logs
CREATE TABLE public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  interviews_scheduled INTEGER DEFAULT 0,
  offers_sent INTEGER DEFAULT 0,
  hires_made INTEGER DEFAULT 0,
  candidates_contacted INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for activity logs
CREATE POLICY "Users can view their own activity logs" 
  ON public.activity_logs 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own activity logs" 
  ON public.activity_logs 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activity logs" 
  ON public.activity_logs 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own activity logs" 
  ON public.activity_logs 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create a unique constraint to prevent duplicate entries for the same user and date
CREATE UNIQUE INDEX activity_logs_user_date_idx ON public.activity_logs (user_id, date);
