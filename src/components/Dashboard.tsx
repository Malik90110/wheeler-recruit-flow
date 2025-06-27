import React, { useState, useEffect } from 'react';
import { Users, Calendar, MessageSquare, ArrowUp, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardProps {
  currentUser: string;
}

interface ActivityMetrics {
  interviewsScheduled: number;
  offersSent: number;
  hiresMade: number;
  onboardingSent: number;
  totalActivities: number;
  dataSource: 'production' | 'activity_logs';
}

export const Dashboard = ({ currentUser }: DashboardProps) => {
  const [metrics, setMetrics] = useState<ActivityMetrics>({
    interviewsScheduled: 0,
    offersSent: 0,
    hiresMade: 0,
    onboardingSent: 0,
    totalActivities: 0,
    dataSource: 'activity_logs'
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchMetrics = async () => {
    if (!user) {
      console.log('Dashboard: No user found');
      return;
    }

    try {
      console.log('=== DASHBOARD DATA FETCH START ===');
      console.log('Dashboard: User ID:', user.id);
      console.log('Dashboard: User Email:', user.email);
      
      // Get user profile first
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Dashboard: Profile error:', profileError);
        return;
      }

      if (!profile) {
        console.log('Dashboard: No profile found for user');
        setLoading(false);
        return;
      }

      const fullName = `${profile.first_name} ${profile.last_name}`;
      console.log('Dashboard: User full name:', fullName);

      // Check for production reports
      console.log('Dashboard: Checking for production reports...');
      const { data: latestReport, error: reportError } = await supabase
        .from('production_reports')
        .select('id, report_date')
        .order('report_date', { ascending: false })
        .limit(1)
        .single();

      console.log('Dashboard: Latest report query result:', { latestReport, reportError });

      let useProductionData = false;
      let reportId = null;

      if (!reportError && latestReport) {
        const reportDate = new Date(latestReport.report_date);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - reportDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        console.log('Dashboard: Report analysis:', {
          reportDate: latestReport.report_date,
          today: today.toISOString().split('T')[0],
          diffDays,
          shouldUseProduction: diffDays <= 1
        });
        
        if (diffDays <= 1) {
          useProductionData = true;
          reportId = latestReport.id;
        }
      }

      if (useProductionData && reportId) {
        console.log('Dashboard: USING PRODUCTION DATA from report:', reportId);
        
        // Get all production entries for this report to see what names exist
        const { data: allEntries, error: allEntriesError } = await supabase
          .from('production_report_entries')
          .select('*')
          .eq('report_id', reportId);

        console.log('Dashboard: All production entries for report:', allEntries);
        console.log('Dashboard: All available names in production report:', 
          allEntries?.map(entry => entry.employee_name) || []);

        // Try to find production data with flexible name matching
        let productionEntry = null;
        
        if (allEntries && allEntries.length > 0) {
          // Try exact match first
          productionEntry = allEntries.find(entry => 
            entry.employee_name.toLowerCase() === fullName.toLowerCase()
          );
          
          // If no exact match, try partial matches
          if (!productionEntry) {
            const firstName = profile.first_name.toLowerCase();
            const lastName = profile.last_name.toLowerCase();
            
            productionEntry = allEntries.find(entry => {
              const entryName = entry.employee_name.toLowerCase();
              return entryName.includes(firstName) && entryName.includes(lastName);
            });
          }
          
          // If still no match, try even more flexible matching
          if (!productionEntry) {
            const userEmail = user.email?.toLowerCase() || '';
            productionEntry = allEntries.find(entry => {
              const entryEmail = entry.employee_email?.toLowerCase() || '';
              return entryEmail === userEmail;
            });
          }
        }

        console.log('Dashboard: Production entry found:', productionEntry);

        if (productionEntry) {
          console.log('Dashboard: FOUND PRODUCTION ENTRY:', productionEntry);
          const productionMetrics = {
            interviewsScheduled: productionEntry.interviews_scheduled || 0,
            offersSent: productionEntry.offers_sent || 0,
            hiresMade: productionEntry.hires_made || 0,
            onboardingSent: productionEntry.onboarding_sent || 0,
            totalActivities: 1,
            dataSource: 'production' as const
          };
          console.log('Dashboard: Setting production metrics:', productionMetrics);
          setMetrics(productionMetrics);
          setLoading(false);
          console.log('=== DASHBOARD DATA FETCH END (PRODUCTION) ===');
          return;
        } else {
          console.log('Dashboard: No matching production entry found');
          console.log('Dashboard: User full name to match:', fullName);
          console.log('Dashboard: User email to match:', user.email);
          console.log('Dashboard: Available names in report:', 
            allEntries?.map(entry => `"${entry.employee_name}" (${entry.employee_email})`) || []);
        }
      }

      // Fall back to activity logs data
      console.log('Dashboard: USING ACTIVITY LOGS DATA');
      const { data: activityData, error: activityError } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      console.log('Dashboard: Activity logs query result:', {
        activityData,
        activityError,
        count: activityData?.length || 0
      });

      if (activityError) {
        console.error('Dashboard: Activity logs error:', activityError);
        return;
      }

      if (activityData && activityData.length > 0) {
        const totals = activityData.reduce((acc, log) => {
          console.log('Dashboard: Processing activity log:', log);
          return {
            interviewsScheduled: acc.interviewsScheduled + (log.interviews_scheduled || 0),
            offersSent: acc.offersSent + (log.offers_sent || 0),
            hiresMade: acc.hiresMade + (log.hires_made || 0),
            onboardingSent: acc.onboardingSent + (log.onboarding_sent || 0),
            totalActivities: acc.totalActivities + 1
          };
        }, {
          interviewsScheduled: 0,
          offersSent: 0,
          hiresMade: 0,
          onboardingSent: 0,
          totalActivities: 0
        });

        console.log('Dashboard: Activity logs totals calculated:', totals);
        const activityMetrics = {
          ...totals,
          dataSource: 'activity_logs' as const
        };
        console.log('Dashboard: Setting activity metrics:', activityMetrics);
        setMetrics(activityMetrics);
      } else {
        console.log('Dashboard: No activity logs found, setting zeros');
        setMetrics({
          interviewsScheduled: 0,
          offersSent: 0,
          hiresMade: 0,
          onboardingSent: 0,
          totalActivities: 0,
          dataSource: 'activity_logs'
        });
      }
      console.log('=== DASHBOARD DATA FETCH END (ACTIVITY LOGS) ===');
    } catch (error) {
      console.error('Dashboard: Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Dashboard: useEffect triggered, user:', user?.email);
    fetchMetrics();

    // Set up real-time subscription for activity_logs changes
    const channel = supabase
      .channel('dashboard-activity-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activity_logs',
          filter: `user_id=eq.${user?.id}`
        },
        (payload) => {
          console.log('Dashboard: Activity log changed:', payload);
          fetchMetrics();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'production_report_entries'
        },
        (payload) => {
          console.log('Dashboard: Production report changed:', payload);
          fetchMetrics();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const [weeklyTrend] = useState([
    { day: 'Mon', interviews: 0, offers: 0, hires: 0 },
    { day: 'Tue', interviews: 0, offers: 0, hires: 0 },
    { day: 'Wed', interviews: 0, offers: 0, hires: 0 },
    { day: 'Thu', interviews: 0, offers: 0, hires: 0 },
    { day: 'Fri', interviews: 0, offers: 0, hires: 0 },
  ]);

  const metricCards = [
    {
      title: 'Interviews Scheduled',
      value: loading ? '...' : metrics.interviewsScheduled,
      icon: Calendar,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: 'Offers Sent',
      value: loading ? '...' : metrics.offersSent,
      icon: MessageSquare,
      color: 'bg-green-500',
      change: '+18%'
    },
    {
      title: 'Hires Made',
      value: loading ? '...' : metrics.hiresMade,
      icon: Users,
      color: 'bg-purple-500',
      change: '+25%'
    },
    {
      title: 'Onboarding Sent',
      value: loading ? '...' : metrics.onboardingSent,
      icon: Package,
      color: 'bg-orange-500',
      change: '+15%'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {currentUser}</h1>
          <p className="text-gray-600 mt-1">Here's your recruiting performance overview</p>
          <p className="text-sm text-gray-500 mt-1">
            Data source: {metrics.dataSource === 'production' ? 'Production Report' : 'Activity Logs'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Total Activity</p>
          <p className="text-lg font-semibold text-gray-900">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-lg ${card.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-600">{card.change}</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mt-4">{card.value}</h3>
              <p className="text-gray-600 text-sm">{card.title}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Activity Trend</h3>
          <div className="space-y-4">
            {weeklyTrend.map((day, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600 w-12">{day.day}</span>
                <div className="flex-1 mx-4">
                  <div className="flex space-x-2">
                    <div className="h-2 bg-blue-200 rounded-full flex-1">
                      <div 
                        className="h-2 bg-blue-500 rounded-full"
                        style={{ width: `${day.interviews > 0 ? (day.interviews / 5) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <div className="h-2 bg-green-200 rounded-full flex-1">
                      <div 
                        className="h-2 bg-green-500 rounded-full"
                        style={{ width: `${day.offers > 0 ? (day.offers / 3) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <div className="h-2 bg-purple-200 rounded-full flex-1">
                      <div 
                        className="h-2 bg-purple-500 rounded-full"
                        style={{ width: `${day.hires > 0 ? (day.hires / 2) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-4 text-sm text-gray-600">
                  <span>{day.interviews}I</span>
                  <span>{day.offers}O</span>
                  <span>{day.hires}H</span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center space-x-6 mt-4 text-xs text-gray-500">
            <span className="flex items-center"><div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>Interviews</span>
            <span className="flex items-center"><div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>Offers</span>
            <span className="flex items-center"><div className="w-3 h-3 bg-purple-500 rounded-full mr-1"></div>Hires</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full p-4 text-left bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors">
              <h4 className="font-medium text-blue-900">Log Today's Activities</h4>
              <p className="text-sm text-blue-700 mt-1">Record interviews, offers, and hires</p>
            </button>
            <button className="w-full p-4 text-left bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors">
              <h4 className="font-medium text-green-900">View Team Performance</h4>
              <p className="text-sm text-green-700 mt-1">Compare metrics across recruiters</p>
            </button>
            <button className="w-full p-4 text-left bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors">
              <h4 className="font-medium text-purple-900">Check Team Messages</h4>
              <p className="text-sm text-purple-700 mt-1">Stay updated with team chat</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
