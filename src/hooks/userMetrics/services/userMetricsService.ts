
import { User } from '@supabase/supabase-js';
import { UserMetrics } from '../types';
import { fetchProductionData } from '../productionDataService';
import { fetchActivityData } from '../activityDataService';

export const fetchUserMetrics = async (user: User): Promise<UserMetrics> => {
  try {
    console.log('UserMetrics: Starting data fetch for user:', user.id);
    
    // Try to get production data first
    const productionResult = await fetchProductionData(user);
    
    if (productionResult.found && productionResult.metrics) {
      return {
        ...productionResult.metrics,
        dataSource: 'production'
      };
    }

    // Fall back to activity logs data
    const activityMetrics = await fetchActivityData(user);
    return {
      ...activityMetrics,
      dataSource: 'activity_logs'
    };
  } catch (error) {
    console.error('UserMetrics: Error fetching user metrics:', error);
    // Return default values on error
    return {
      totalInterviews: 0,
      totalOffers: 0,
      totalHires: 0,
      totalOnboarding: 0,
      dataSource: 'activity_logs'
    };
  }
};
