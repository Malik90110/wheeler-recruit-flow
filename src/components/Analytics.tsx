import React, { useState, useEffect } from 'react';
import { BarChart, Users, Calendar, ArrowUp, ArrowDown } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const Analytics = () => {
  const [recruiterFilter, setRecruiterFilter] = useState('all');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [userMetrics, setUserMetrics] = useState({
    totalInterviews: 0,
    totalOffers: 0,
    totalHires: 0,
    totalOnboarding: 0,
    dataSource: 'activity_logs'
  });
  const { user } = useAuth();

  const fetchUserMetrics = async () => {
    if (!user) return;

    try {
      console.log('Analytics: Starting data fetch for user:', user.id);
      
      // Get user profile first
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single();

      if (!profile) {
        console.log('Analytics: No profile found');
        return;
      }

      const fullName = `${profile.first_name} ${profile.last_name}`;
      console.log('Analytics: User full name:', fullName);

      // Check for recent production data first
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
        
        console.log('Analytics: Latest report date:', latestReport.report_date, 'Days diff:', diffDays);
        
        if (diffDays <= 1) {
          useProductionData = true;
          reportId = latestReport.id;
        }
      }

      if (useProductionData && reportId) {
        console.log('Analytics: Using production data from report:', reportId);
        
        // Get production data for this specific user by name
        const { data: productionEntry, error: entryError } = await supabase
          .from('production_report_entries')
          .select('*')
          .eq('report_id', reportId)
          .eq('employee_name', fullName)
          .single();

        if (!entryError && productionEntry) {
          console.log('Analytics: Found production entry:', productionEntry);
          setUserMetrics({
            totalInterviews: productionEntry.interviews_scheduled || 0,
            totalOffers: productionEntry.offers_sent || 0,
            totalHires: productionEntry.hires_made || 0,
            totalOnboarding: productionEntry.onboarding_sent || 0,
            dataSource: 'production'
          });
          return;
        } else {
          console.log('Analytics: No production entry found for user, falling back to activity logs');
        }
      }

      // Fall back to activity logs data - sum all entries for this user
      console.log('Analytics: Using activity logs data');
      const { data: activityData, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) {
        console.error('Analytics: Error fetching activity logs:', error);
        return;
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

        console.log('Analytics: Activity logs totals:', totals);
        setUserMetrics({
          ...totals,
          dataSource: 'activity_logs'
        });
      } else {
        console.log('Analytics: No activity logs found');
        setUserMetrics({
          totalInterviews: 0,
          totalOffers: 0,
          totalHires: 0,
          totalOnboarding: 0,
          dataSource: 'activity_logs'
        });
      }
    } catch (error) {
      console.error('Analytics: Error fetching user metrics:', error);
    }
  };

  useEffect(() => {
    fetchUserMetrics();

    // Set up real-time subscription for analytics
    const channel = supabase
      .channel('analytics-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activity_logs',
          filter: `user_id=eq.${user?.id}`
        },
        () => {
          console.log('Analytics: Activity log changed, refreshing metrics');
          fetchUserMetrics();
          setRefreshTrigger(prev => prev + 1);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'production_report_entries'
        },
        () => {
          console.log('Analytics: Production report changed, refreshing metrics');
          fetchUserMetrics();
          setRefreshTrigger(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Get real-time analytics data for team performance
  const { data: realTimeData, loading: realTimeLoading } = useAnalytics('monthly', recruiterFilter, refreshTrigger);

  if (realTimeLoading) {
    return (
      <div className="max-w-6xl space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="animate-pulse">
                <div className="h-12 bg-gray-200 rounded mb-4"></div>
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const successRate = userMetrics.totalInterviews > 0 ? 
    Number(((userMetrics.totalHires / userMetrics.totalInterviews) * 100).toFixed(1)) : 0;

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Performance Analytics</h1>
          <p className="text-gray-600 mt-1">Your performance insights and team trends</p>
          <p className="text-sm text-gray-500 mt-1">
            Personal data source: {userMetrics.dataSource === 'production' ? 'Production Report' : 'Activity Logs'}
          </p>
        </div>
        
        <div className="mt-4 lg:mt-0">
          <select 
            value={recruiterFilter}
            onChange={(e) => setRecruiterFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Recruiters</option>
            {realTimeData.teamData.map((member, index) => (
              <option key={index} value={member.name.toLowerCase().replace(' ', '')}>
                {member.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex items-center text-green-600">
              <ArrowUp className="w-4 h-4" />
              <span className="text-sm font-medium">+12%</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mt-4">{userMetrics.totalInterviews.toLocaleString()}</h3>
          <p className="text-gray-600 text-sm">Total Interviews</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex items-center text-green-600">
              <ArrowUp className="w-4 h-4" />
              <span className="text-sm font-medium">+18%</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mt-4">{userMetrics.totalOffers.toLocaleString()}</h3>
          <p className="text-gray-600 text-sm">Offers Sent</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-purple-100 rounded-lg">
              <BarChart className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex items-center text-green-600">
              <ArrowUp className="w-4 h-4" />
              <span className="text-sm font-medium">+25%</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mt-4">{userMetrics.totalHires.toLocaleString()}</h3>
          <p className="text-gray-600 text-sm">Successful Hires</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-orange-100 rounded-lg">
              <ArrowUp className="w-6 h-6 text-orange-600" />
            </div>
            <div className="flex items-center text-red-600">
              <ArrowDown className="w-4 h-4" />
              <span className="text-sm font-medium">-2%</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mt-4">{successRate}%</h3>
          <p className="text-gray-600 text-sm">Success Rate</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Monthly Performance Trends</h3>
          {realTimeData.monthlyTrends.length > 0 ? (
            <div className="space-y-4">
              {realTimeData.monthlyTrends.map((period, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">{period.month}</span>
                    <div className="flex space-x-4 text-sm text-gray-600">
                      <span>{period.interviews}I</span>
                      <span>{period.offers}O</span>
                      <span>{period.hires}H</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <div className="h-2 bg-blue-200 rounded-full flex-1">
                      <div 
                        className="h-2 bg-blue-500 rounded-full"
                        style={{ width: `${Math.min((period.interviews / Math.max(...realTimeData.monthlyTrends.map(m => m.interviews))) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <div className="h-2 bg-green-200 rounded-full flex-1">
                      <div 
                        className="h-2 bg-green-500 rounded-full"
                        style={{ width: `${Math.min((period.offers / Math.max(...realTimeData.monthlyTrends.map(m => m.offers))) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <div className="h-2 bg-purple-200 rounded-full flex-1">
                      <div 
                        className="h-2 bg-purple-500 rounded-full"
                        style={{ width: `${Math.min((period.hires / Math.max(...realTimeData.monthlyTrends.map(m => m.hires))) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <p>No trend data available yet</p>
              <p className="text-sm">Start logging activities to see trends</p>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Team Performance Ranking</h3>
          {realTimeData.teamData.length > 0 ? (
            <div className="space-y-4">
              {realTimeData.teamData.sort((a, b) => b.ratio - a.ratio).map((recruiter, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-blue-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{recruiter.name}</p>
                      <p className="text-sm text-gray-500">{recruiter.hires} hires this month</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{recruiter.ratio}%</p>
                    <p className="text-xs text-gray-500">Success Rate</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <p>No team data available</p>
              <p className="text-sm">Team members will appear here once they start logging activities</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
