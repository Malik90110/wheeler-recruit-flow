
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Contest {
  id: string;
  title: string;
  description: string;
  rules: string[];
  start_date: string;
  end_date: string;
  status: 'active' | 'upcoming' | 'completed' | 'paused';
  target_metrics: string[];
  prize: string;
  participants: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const useContests = () => {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchContests = async () => {
    try {
      const { data, error } = await supabase
        .from('contests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching contests:', error);
        return;
      }

      // Type assertion to ensure proper typing
      const typedData = data as Contest[];
      setContests(typedData || []);
    } catch (error) {
      console.error('Error fetching contests:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateContestStatus = async (contestId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('contests')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', contestId);

      if (error) {
        console.error('Error updating contest status:', error);
        return false;
      }

      // Refresh contests data
      await fetchContests();
      return true;
    } catch (error) {
      console.error('Error updating contest status:', error);
      return false;
    }
  };

  const startContest = (contestId: string) => updateContestStatus(contestId, 'active');
  const pauseContest = (contestId: string) => updateContestStatus(contestId, 'paused');
  const endContest = (contestId: string) => updateContestStatus(contestId, 'completed');

  useEffect(() => {
    fetchContests();

    // Set up real-time subscription
    const channel = supabase
      .channel('contests-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contests'
        },
        () => {
          console.log('Contest updated, refreshing data');
          fetchContests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    contests,
    loading,
    startContest,
    pauseContest,
    endContest,
    refreshContests: fetchContests
  };
};
