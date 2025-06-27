
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
        // First, get the latest production report to see if we should use production data or activity logs
        const { data: latestReport, error: reportError } = await supabase
          .from('production_reports')
          .select('id, report_date')
          .order('report_date', { ascending: false })
          .limit(1)
          .single();

        let useProductionData = false;
        let reportId = null;

        if (!reportError && latestReport) {
          const reportDate = new Date(latestReport.report_date);
          const today = new Date();
          const diffTime = Math.abs(today.getTime() - reportDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          // Use production data if report is from today or yesterday
          if (diffDays <= 1) {
            useProductionData = true;
            reportId = latestReport.id;
          }
        }

        if (useProductionData && reportId) {
          // Use production report data
          const { data: productionEntries, error: entriesError } = await supabase
            .from('production_report_entries')
            .select('*')
            .eq('report_id', reportId);

          if (entriesError) {
            console.error('Error fetching production entries:', entriesError);
            throw entriesError;
          }

          if (productionEntries && productionEntries.length > 0) {
            // Calculate totals from production data
            const totalInterviews = productionEntries.reduce((sum, entry) => sum + (entry.interviews_scheduled || 0), 0);
            const totalOffers = productionEntries.reduce((sum, entry) => sum + (entry.offers_sent || 0), 0);
            const totalHires = productionEntries.reduce((sum, entry) => sum + (entry.hires_made || 0), 0);
            const successRate = totalInterviews > 0 ? Number(((totalHires / totalInterviews) * 100).toFixed(1)) : 0;

            // Create team data from production entries
            const teamData = productionEntries.map(entry => ({
              name: entry.employee_name,
              interviews: entry.interviews_scheduled || 0,
              offers: entry.offers_sent || 0,
              hires: entry.hires_made || 0,
              ratio: (entry.interviews_scheduled || 0) > 0 ? 
                Number(((entry.hires_made || 0) / (entry.interviews_scheduled || 0) * 100).toFixed(1)) : 0
            }));

            // For monthly trends with production data, we'll use a simplified approach
            const monthlyTrends = [{
              month: new Date().toLocaleDateString('en-US', { month: 'short' }),
              interviews: totalInterviews,
              offers: totalOffers,
              hires: totalHires
            }];

            setData({
              totalInterviews,
              totalOffers,
              totalHires,
              successRate,
              monthlyTrends,
              teamData
            });
          }
        } else {
          // Fall back to activity logs data
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

            setData({
              totalInterviews,
              totalOffers,
              totalHires,
              successRate,
              monthlyTrends,
              teamData
            });
          }
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
