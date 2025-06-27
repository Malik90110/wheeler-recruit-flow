
-- Create contests table
CREATE TABLE public.contests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  rules TEXT[] NOT NULL DEFAULT '{}',
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('active', 'upcoming', 'completed', 'paused')),
  target_metrics TEXT[] NOT NULL DEFAULT '{}',
  prize TEXT NOT NULL,
  participants INTEGER NOT NULL DEFAULT 0,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contests ENABLE ROW LEVEL SECURITY;

-- Create policies for contests
CREATE POLICY "Anyone can view contests" 
  ON public.contests 
  FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Managers can create contests" 
  ON public.contests 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Managers can update contests" 
  ON public.contests 
  FOR UPDATE 
  TO authenticated 
  USING (true);

CREATE POLICY "Managers can delete contests" 
  ON public.contests 
  FOR DELETE 
  TO authenticated 
  USING (true);

-- Create contest participants table
CREATE TABLE public.contest_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id UUID NOT NULL REFERENCES public.contests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(contest_id, user_id)
);

-- Enable RLS for participants
ALTER TABLE public.contest_participants ENABLE ROW LEVEL SECURITY;

-- Create policies for contest participants
CREATE POLICY "Anyone can view contest participants" 
  ON public.contest_participants 
  FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Users can join contests" 
  ON public.contest_participants 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave contests" 
  ON public.contest_participants 
  FOR DELETE 
  TO authenticated 
  USING (auth.uid() = user_id);
