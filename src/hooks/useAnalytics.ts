
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

export const useAnalytics = (timeFilter: string, recruiterFilter: string) => {
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
        // For now, we'll use the profiles table to get team members
        // In a real implementation, you'd have activity logs table
        const { data: profiles } = await supabase
          .from('profiles')
          .select('first_name, last_name');

        if (profiles) {
          // Generate realistic sample data based on actual team members
          const teamData = profiles.map((profile, index) => {
            const baseInterviews = 30 + Math.floor(Math.random() * 25);
            const baseOffers = Math.floor(baseInterviews * (0.6 + Math.random() * 0.2));
            const baseHires = Math.floor(baseOffers * (0.65 + Math.random() * 0.2));
            const ratio = baseHires > 0 ? Number(((baseHires / baseInterviews) * 100).toFixed(1)) : 0;

            return {
              name: `${profile.first_name} ${profile.last_name}`,
              interviews: baseInterviews,
              offers: baseOffers,
              hires: baseHires,
              ratio
            };
          });

          // Calculate totals
          const totalInterviews = teamData.reduce((sum, member) => sum + member.interviews, 0);
          const totalOffers = teamData.reduce((sum, member) => sum + member.offers, 0);
          const totalHires = teamData.reduce((sum, member) => sum + member.hires, 0);
          const successRate = totalInterviews > 0 ? Number(((totalHires / totalInterviews) * 100).toFixed(1)) : 0;

          // Generate monthly trends (last 5 months)
          const months = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const monthlyTrends = months.map((month, index) => {
            const growth = 1 + (index * 0.1); // 10% growth each month
            return {
              month,
              interviews: Math.floor(totalInterviews * 0.15 * growth),
              offers: Math.floor(totalOffers * 0.15 * growth),
              hires: Math.floor(totalHires * 0.15 * growth)
            };
          });

          setData({
            totalInterviews,
            totalOffers,
            totalHires,
            successRate,
            monthlyTrends,
            teamData
          });
        }
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        // Fallback to minimal data
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
  }, [timeFilter, recruiterFilter]);

  return { data, loading };
};
