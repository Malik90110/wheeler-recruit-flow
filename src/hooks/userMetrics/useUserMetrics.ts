
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserMetrics } from './types';
import { fetchUserMetrics } from './services/userMetricsService';
import { createUserMetricsSubscription, removeSubscription } from './services/realtimeService';

export const useUserMetrics = (refreshTrigger: number) => {
  const [userMetrics, setUserMetrics] = useState<UserMetrics>({
    totalInterviews: 0,
    totalOffers: 0,
    totalHires: 0,
    totalOnboarding: 0,
    dataSource: 'activity_logs'
  });
  const { user } = useAuth();

  const refreshMetrics = async () => {
    if (!user) return;
    
    const metrics = await fetchUserMetrics(user);
    setUserMetrics(metrics);
  };

  useEffect(() => {
    refreshMetrics();

    // Set up real-time subscription
    const channel = createUserMetricsSubscription(user, refreshMetrics);

    return () => {
      if (channel) {
        removeSubscription(channel);
      }
    };
  }, [user, refreshTrigger]);

  return userMetrics;
};
