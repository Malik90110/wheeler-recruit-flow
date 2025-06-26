
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Announcement } from './types';

export const useBulletinAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchAnnouncements();
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single();
      
      if (profile) {
        setCurrentUser(`${profile.first_name} ${profile.last_name}`);
      }
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching announcements:', error);
      } else {
        // Cast the priority field to the correct type
        const typedAnnouncements = (data || []).map(announcement => ({
          ...announcement,
          priority: announcement.priority as 'high' | 'medium' | 'low'
        }));
        setAnnouncements(typedAnnouncements);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    announcements,
    loading,
    currentUser,
    fetchAnnouncements
  };
};
