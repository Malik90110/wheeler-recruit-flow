
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { UserMetrics } from './types';
import { fetchProductionData } from './productionDataService';
import { fetchActivityData } from './activityDataService';

export const useUserMetrics = (refreshTrigger: number) => {
  const [userMetrics, setUserMetrics] = useState<UserMetrics>({
    totalInterviews: 0,
    totalOffers: 0,
    totalHires: 0,
    totalOnboarding: 0,
    dataSource: 'activity_logs'
  });
  const { user } = useAuth();

  const fetchUserMetrics = async () => {
    if (!user) return;

    try {
      console.log('UserMetrics: Starting data fetch for user:', user.id);
      
      // Try to get production data first
      const productionResult = await fetchProductionData(user);
      
      if (productionResult.found && productionResult.metrics) {
        setUserMetrics({
          ...productionResult.metrics,
          dataSource: 'production'
        });
        return;
      }

      // Fall back to activity logs data
      const activityMetrics = await fetchActivityData(user);
      setUserMetrics({
        ...activityMetrics,
        dataSource: 'activity_logs'
      });
    } catch (error) {
      console.error('UserMetrics: Error fetching user metrics:', error);
    }
  };

  useEffect(() => {
    fetchUserMetrics();

    // Set up real-time subscription for analytics
    const channel = supabase
      .channel('analytics-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activity_logs',
          filter: `user_id=eq.${user?.id}`
        },
        () => {
          console.log('UserMetrics: Activity log changed, refreshing metrics');
          fetchUserMetrics();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'production_report_entries'
        },
        () => {
          console.log('UserMetrics: Production report changed, refreshing metrics');
          fetchUserMetrics();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, refreshTrigger]);

  return userMetrics;
};
