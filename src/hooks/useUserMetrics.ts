
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UserMetrics {
  totalInterviews: number;
  totalOffers: number;
  totalHires: number;
  totalOnboarding: number;
  dataSource: 'production' | 'activity_logs';
}

export const useUserMetrics = (refreshTrigger: number) => {
  const [userMetrics, setUserMetrics] = useState<UserMetrics>({
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
        
        // Get all production entries for this report to see what names exist
        const { data: allEntries, error: allEntriesError } = await supabase
          .from('production_report_entries')
          .select('*')
          .eq('report_id', reportId);

        console.log('Analytics: All production entries for report:', allEntries);
        console.log('Analytics: All available names in production report:', 
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

        console.log('Analytics: Production entry found:', productionEntry);

        if (productionEntry) {
          console.log('Analytics: FOUND PRODUCTION ENTRY:', productionEntry);
          setUserMetrics({
            totalInterviews: productionEntry.interviews_scheduled || 0,
            totalOffers: productionEntry.offers_sent || 0,
            totalHires: productionEntry.hires_made || 0,
            totalOnboarding: productionEntry.onboarding_sent || 0,
            dataSource: 'production'
          });
          return;
        } else {
          console.log('Analytics: No matching production entry found');
          console.log('Analytics: User full name to match:', fullName);
          console.log('Analytics: User email to match:', user.email);
          console.log('Analytics: Available names in report:', 
            allEntries?.map(entry => `"${entry.employee_name}" (${entry.employee_email})`) || []);
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
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, refreshTrigger]);

  return userMetrics;
};
