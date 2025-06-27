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
        // Fetch activity logs with profile data
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

          // Convert to array and add ratio
          const teamData = Array.from(teamPerformance.values()).map((member: any) => ({
            ...member,
            ratio: member.interviews > 0 ? Number(((member.hires / member.interviews) * 100).toFixed(1)) : 0
          }));

          // Calculate totals
          const totalInterviews = teamData.reduce((sum, member) => sum + member.interviews, 0);
          const totalOffers = teamData.reduce((sum, member) => sum + member.offers, 0);
          const totalHires = teamData.reduce((sum, member) => sum + member.hires, 0);
          const successRate = totalInterviews > 0 ? Number(((totalHires / totalInterviews) * 100).toFixed(1)) : 0;

          // Generate trends based on time filter
          const trendsData = new Map();
          
          if (timeFilter === 'daily') {
            // Last 7 days
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            for (let i = 6; i >= 0; i--) {
              const date = new Date();
              date.setDate(date.getDate() - i);
              const dateStr = date.toISOString().split('T')[0];
              const dayName = dayNames[date.getDay()];
              
              trendsData.set(dateStr, {
                month: dayName,
                interviews: 0,
                offers: 0,
                hires: 0
              });
            }
            
            activityLogs.forEach((log: any) => {
              const logDate = log.date;
              if (trendsData.has(logDate)) {
                const day = trendsData.get(logDate);
                day.interviews += log.interviews_scheduled || 0;
                day.offers += log.offers_sent || 0;
                day.hires += log.hires_made || 0;
              }
            });
          } else if (timeFilter === 'weekly') {
            // Last 4 weeks
            for (let i = 3; i >= 0; i--) {
              const date = new Date();
              date.setDate(date.getDate() - (i * 7));
              const weekStart = new Date(date);
              weekStart.setDate(date.getDate() - date.getDay());
              const weekKey = `Week ${4 - i}`;
              
              trendsData.set(weekKey, {
                month: weekKey,
                interviews: 0,
                offers: 0,
                hires: 0
              });
            }
            
            activityLogs.forEach((log: any) => {
              const logDate = new Date(log.date);
              const weekStart = new Date(logDate);
              weekStart.setDate(logDate.getDate() - logDate.getDay());
              
              // Find which week this belongs to
              for (let i = 0; i < 4; i++) {
                const checkDate = new Date();
                checkDate.setDate(checkDate.getDate() - (i * 7));
                const checkWeekStart = new Date(checkDate);
                checkWeekStart.setDate(checkDate.getDate() - checkDate.getDay());
                
                if (Math.abs(weekStart.getTime() - checkWeekStart.getTime()) < 7 * 24 * 60 * 60 * 1000) {
                  const weekKey = `Week ${4 - i}`;
                  if (trendsData.has(weekKey)) {
                    const week = trendsData.get(weekKey);
                    week.interviews += log.interviews_scheduled || 0;
                    week.offers += log.offers_sent || 0;
                    week.hires += log.hires_made || 0;
                  }
                  break;
                }
              }
            });
          } else {
            // Monthly (default)
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
          }

          const monthlyTrends = Array.from(trendsData.values()).slice(-6); // Last 6 periods

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
        // Fallback to empty data on error
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
