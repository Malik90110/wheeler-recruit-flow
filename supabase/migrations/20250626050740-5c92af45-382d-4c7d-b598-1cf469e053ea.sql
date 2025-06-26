
-- Create announcements table
CREATE TABLE public.announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  category TEXT NOT NULL DEFAULT 'Administrative',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view announcements" 
  ON public.announcements 
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Users can create announcements" 
  ON public.announcements 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own announcements" 
  ON public.announcements 
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own announcements" 
  ON public.announcements 
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = user_id);
