
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { UserMetrics } from './types';

export const fetchActivityData = async (user: User): Promise<Omit<UserMetrics, 'dataSource'>> => {
  try {
    console.log('UserMetrics: Using activity logs data');
    const { data: activityData, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (error) {
      console.error('UserMetrics: Error fetching activity logs:', error);
      return {
        totalInterviews: 0,
        totalOffers: 0,
        totalHires: 0,
        totalOnboarding: 0
      };
    }

    if (activityData && activityData.length > 0) {
      const totals = activityData.reduce((acc, log) => ({
        totalInterviews: acc.totalInterviews + (log.interviews_scheduled || 0),
        totalOffers: acc.totalOffers + (log.offers_sent || 0),
        totalHires: acc.totalHires + (log.hires_made || 0),
        totalOnboarding: acc.totalOnboarding + (log.onboarding_sent || 0)
      }), {
        totalInterviews: 0,
        totalOffers: 0,
        totalHires: 0,
        totalOnboarding: 0
      });

      console.log('UserMetrics: Activity logs totals:', totals);
      return totals;
    } else {
      console.log('UserMetrics: No activity logs found');
      return {
        totalInterviews: 0,
        totalOffers: 0,
        totalHires: 0,
        totalOnboarding: 0
      };
    }
  } catch (error) {
    console.error('UserMetrics: Error fetching activity data:', error);
    return {
      totalInterviews: 0,
      totalOffers: 0,
      totalHires: 0,
      totalOnboarding: 0
    };
  }
};
