
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AnalyticsData {
  totalInterviews: number;
  totalOffers: number;
  totalHires: number;
  successRate: number;
  monthlyTrends: Array<{
    month: string;
    interviews: number;
    offers: number;
    hires: number;
  }>;
  teamData: Array<{
    name: string;
    interviews: number;
    offers: number;
    hires: number;
    ratio: number;
  }>;
}

export const useAnalytics = (timeFilter: string, recruiterFilter: string, refreshTrigger?: number) => {
  const [data, setData] = useState<AnalyticsData>({
    totalInterviews: 0,
    totalOffers: 0,
    totalHires: 0,
    successRate: 0,
    monthlyTrends: [],
    teamData: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true);
      
      try {
        // Fetch activity logs with profile data - using the same query as daily report
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

        if (activityLogs && activityLogs.length > 0) {
          // Calculate team performance using the same logic as daily report
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

          // Convert to array and add ratio - same as daily report
          const teamData = Array.from(teamPerformance.values()).map((member: any) => ({
            ...member,
            ratio: member.interviews > 0 ? Number(((member.hires / member.interviews) * 100).toFixed(1)) : 0
          }));

          // Calculate totals - same as daily report
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

          setData({
            totalInterviews,
            totalOffers,
            totalHires,
            successRate,
            monthlyTrends,
            teamData
          });
        } else {
          // No data available, set empty state
          setData({
            totalInterviews: 0,
            totalOffers: 0,
            totalHires: 0,
            successRate: 0,
            monthlyTrends: [],
            teamData: []
          });
        }
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        setData({
          totalInterviews: 0,
          totalOffers: 0,
          totalHires: 0,
          successRate: 0,
          monthlyTrends: [],
          teamData: []
        });
      }
      
      setLoading(false);
    };

    fetchAnalyticsData();
  }, [timeFilter, recruiterFilter, refreshTrigger]);

  return { data, loading };
};
