
import { useState, useEffect } from 'react';
import { AnalyticsData } from './types';
import { fetchProductionData } from './productionDataService';
import { fetchActivityLogsData } from './activityDataService';

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
        // Try to get production data first
        const { data: productionData, useProduction } = await fetchProductionData();
        
        if (useProduction && productionData) {
          setData(productionData);
        } else {
          // Fall back to activity logs data
          const activityData = await fetchActivityLogsData();
          setData(activityData);
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
