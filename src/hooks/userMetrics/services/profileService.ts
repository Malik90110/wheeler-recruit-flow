
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export interface UserProfile {
  first_name: string;
  last_name: string;
}

export const fetchUserProfile = async (user: User): Promise<UserProfile | null> => {
  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name')
    .eq('id', user.id)
    .single();

  if (!profile) {
    console.log('UserMetrics: No profile found');
    return null;
  }

  console.log('UserMetrics: User full name:', `${profile.first_name} ${profile.last_name}`);
  return profile;
};
