
-- Create a function to delete a user profile and associated data
CREATE OR REPLACE FUNCTION public.delete_user_profile(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only allow managers and admins to delete profiles
  IF NOT (public.has_role(auth.uid(), 'manager') OR public.has_role(auth.uid(), 'admin')) THEN
    RAISE EXCEPTION 'Insufficient permissions to delete user profiles';
  END IF;

  -- Delete user's activity logs
  DELETE FROM public.activity_logs WHERE user_id = _user_id;
  
  -- Delete user's roles
  DELETE FROM public.user_roles WHERE user_id = _user_id;
  
  -- Delete user's announcements
  DELETE FROM public.announcements WHERE user_id = _user_id;
  
  -- Delete user's contest participations
  DELETE FROM public.contest_participants WHERE user_id = _user_id;
  
  -- Delete user's production report entries
  DELETE FROM public.production_report_entries WHERE user_id = _user_id;
  
  -- Delete user's production reports
  DELETE FROM public.production_reports WHERE uploaded_by = _user_id;
  
  -- Delete user's activity discrepancies
  DELETE FROM public.activity_discrepancies WHERE user_id = _user_id OR resolved_by = _user_id;
  
  -- Finally, delete the profile
  DELETE FROM public.profiles WHERE id = _user_id;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- Create RLS policy to allow managers to view all profiles for deletion purposes
CREATE POLICY "Managers can view all profiles for management"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'manager') OR 
  public.has_role(auth.uid(), 'admin') OR
  auth.uid() = id
);
