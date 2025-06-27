
import { supabase } from '@/integrations/supabase/client';
import { AnalyticsData, ActivityLog } from './types';

export const fetchActivityLogsData = async (): Promise<AnalyticsData> => {
  try {
    const { data: activityLogs, error: logsError } = await supabase
      .from('activity_logs')
      .select(`
        *,
        profiles!inner(first_name, last_name)
      `)
      .order('date', { ascending: false });

    if (logsError) {
      console.error('Error fetching activity logs:', logsError);
      throw logsError;
    }

    if (!activityLogs || activityLogs.length === 0) {
      return {
        totalInterviews: 0,
        totalOffers: 0,
        totalHires: 0,
        successRate: 0,
        monthlyTrends: [],
        teamData: []
      };
    }

    // Calculate team performance
    const teamPerformance = new Map();
    
    activityLogs.forEach((log: any) => {
      const name = `${log.profiles.first_name} ${log.profiles.last_name}`;
      
      if (!teamPerformance.has(name)) {
        teamPerformance.set(name, {
          name,
          interviews: 0,
          offers: 0,
          hires: 0
        });
      }
      
      const member = teamPerformance.get(name);
      member.interviews += log.interviews_scheduled || 0;
      member.offers += log.offers_sent || 0;
      member.hires += log.hires_made || 0;
    });

    const teamData = Array.from(teamPerformance.values()).map((member: any) => ({
      ...member,
      ratio: member.interviews > 0 ? Number(((member.hires / member.interviews) * 100).toFixed(1)) : 0
    }));

    const totalInterviews = activityLogs.reduce((sum, log) => sum + (log.interviews_scheduled || 0), 0);
    const totalOffers = activityLogs.reduce((sum, log) => sum + (log.offers_sent || 0), 0);
    const totalHires = activityLogs.reduce((sum, log) => sum + (log.hires_made || 0), 0);
    const successRate = totalInterviews > 0 ? Number(((totalHires / totalInterviews) * 100).toFixed(1)) : 0;

    // Generate monthly trends
    const trendsData = new Map();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    activityLogs.forEach((log: any) => {
      const date = new Date(log.date);
      const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      
      if (!trendsData.has(monthKey)) {
        trendsData.set(monthKey, {
          month: monthNames[date.getMonth()],
          interviews: 0,
          offers: 0,
          hires: 0
        });
      }
      
      const month = trendsData.get(monthKey);
      month.interviews += log.interviews_scheduled || 0;
      month.offers += log.offers_sent || 0;
      month.hires += log.hires_made || 0;
    });

    const monthlyTrends = Array.from(trendsData.values()).slice(-6);

    return {
      totalInterviews,
      totalOffers,
      totalHires,
      successRate,
      monthlyTrends,
      teamData
    };
  } catch (error) {
    console.error('Error fetching activity logs data:', error);
    return {
      totalInterviews: 0,
      totalOffers: 0,
      totalHires: 0,
      successRate: 0,
      monthlyTrends: [],
      teamData: []
    };
  }
};
