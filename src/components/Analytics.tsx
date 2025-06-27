
import React, { useState } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useUserMetrics } from '@/hooks/useUserMetrics';
import { AnalyticsHeader } from './analytics/AnalyticsHeader';
import { MetricsCards } from './analytics/MetricsCards';
import { MonthlyTrends } from './analytics/MonthlyTrends';
import { TeamRanking } from './analytics/TeamRanking';
import { LoadingState } from './analytics/LoadingState';

export const Analytics = () => {
  const [recruiterFilter, setRecruiterFilter] = useState('all');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Get user metrics with real-time updates
  const userMetrics = useUserMetrics(refreshTrigger);

  // Get real-time analytics data for team performance
  const { data: realTimeData, loading: realTimeLoading } = useAnalytics('monthly', recruiterFilter, refreshTrigger);

  if (realTimeLoading) {
    return <LoadingState />;
  }

  return (
    <div className="max-w-6xl space-y-6">
      <AnalyticsHeader
        dataSource={userMetrics.dataSource}
        recruiterFilter={recruiterFilter}
        onRecruiterFilterChange={setRecruiterFilter}
        teamData={realTimeData.teamData}
      />

      <MetricsCards userMetrics={userMetrics} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MonthlyTrends monthlyTrends={realTimeData.monthlyTrends} />
        <TeamRanking teamData={realTimeData.teamData} />
      </div>
    </div>
  );
};
