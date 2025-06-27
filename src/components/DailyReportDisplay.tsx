
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, TrendingUp, Users, Award, Target } from 'lucide-react';

interface DailyReportData {
  totalUsers: number;
  totalInterviews: number;
  totalOffers: number;
  totalHires: number;
  successRate: number;
  topPerformers: Array<{
    name: string;
    interviews: number;
    offers: number;
    hires: number;
    ratio: number;
  }>;
  yesterdayActivity: Array<{
    name: string;
    interviews: number;
    offers: number;
    hires: number;
    candidates_contacted: number;
  }>;
  reportDate: string;
  userPersonalData?: {
    interviews: number;
    offers: number;
    hires: number;
    onboarding: number;
  };
}

export const DailyReportDisplay = () => {
  const [reportData, setReportData] = useState<DailyReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchDailyReport = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('daily-report', {
        body: { displayOnly: true }
      });

      if (error) throw error;

      if (data?.reportData) {
        let updatedReportData = {
          ...data.reportData,
          reportDate: new Date().toLocaleDateString()
        };

        // If user is logged in, get their personal data with improved matching
        if (user) {
          const personalData = await fetchUserPersonalData();
          if (personalData) {
            updatedReportData.userPersonalData = personalData;
          }
        }

        setReportData(updatedReportData);
      }
    } catch (error: any) {
      console.error('Error fetching daily report:', error);
      toast({
        title: "Error",
        description: "Failed to load daily report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPersonalData = async () => {
    if (!user) return null;

    try {
      console.log('DailyReport: Fetching personal data for user:', user.id);
      
      // Get user profile first
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single();

      if (!profile) return null;

      const fullName = `${profile.first_name} ${profile.last_name}`;
      console.log('DailyReport: User full name:', fullName);

      // Check for recent production data
      const { data: latestReport } = await supabase
        .from('production_reports')
        .select('id, report_date')
        .order('report_date', { ascending: false })
        .limit(1)
        .single();

      if (latestReport) {
        const reportDate = new Date(latestReport.report_date);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - reportDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 1) {
          // Get all production entries for flexible matching
          const { data: allEntries } = await supabase
            .from('production_report_entries')
            .select('*')
            .eq('report_id', latestReport.id);

          if (allEntries && allEntries.length > 0) {
            let productionEntry = null;
            
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
            
            // If still no match, try email matching
            if (!productionEntry) {
              const userEmail = user.email?.toLowerCase() || '';
              productionEntry = allEntries.find(entry => {
                const entryEmail = entry.employee_email?.toLowerCase() || '';
                return entryEmail === userEmail;
              });
            }

            if (productionEntry) {
              console.log('DailyReport: Found production entry:', productionEntry);
              return {
                interviews: productionEntry.interviews_scheduled || 0,
                offers: productionEntry.offers_sent || 0,
                hires: productionEntry.hires_made || 0,
                onboarding: productionEntry.onboarding_sent || 0
              };
            }
          }
        }
      }

      // Fall back to activity logs
      const { data: activityData } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (activityData && activityData.length > 0) {
        const totals = activityData.reduce((acc, log) => ({
          interviews: acc.interviews + (log.interviews_scheduled || 0),
          offers: acc.offers + (log.offers_sent || 0),
          hires: acc.hires + (log.hires_made || 0),
          onboarding: acc.onboarding + (log.onboarding_sent || 0)
        }), {
          interviews: 0,
          offers: 0,
          hires: 0,
          onboarding: 0
        });

        return totals;
      }

      return null;
    } catch (error) {
      console.error('Error fetching user personal data:', error);
      return null;
    }
  };

  useEffect(() => {
    fetchDailyReport();
  }, [user]);

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Daily Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Loading report data...</p>
        </CardContent>
      </Card>
    );
  }

  if (!reportData) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Daily Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No report data available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Daily Analytics Report
          </CardTitle>
          <CardDescription>
            Report for {reportData.reportDate} - Last 30 Days Overview
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Personal Data Section (if user is logged in) */}
          {reportData.userPersonalData && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold mb-3 text-blue-900">Your Personal Data</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="text-center">
                  <div className="text-xl font-bold text-blue-600">{reportData.userPersonalData.interviews}</div>
                  <div className="text-sm text-blue-700">Interviews</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-green-600">{reportData.userPersonalData.offers}</div>
                  <div className="text-sm text-green-700">Offers</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-purple-600">{reportData.userPersonalData.hires}</div>
                  <div className="text-sm text-purple-700">Hires</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-orange-600">{reportData.userPersonalData.onboarding}</div>
                  <div className="text-sm text-orange-700">Onboarding</div>
                </div>
              </div>
            </div>
          )}

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Users className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold text-blue-600">{reportData.totalUsers}</div>
              <div className="text-sm text-gray-600">Total Users</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Calendar className="w-6 h-6 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold text-green-600">{reportData.totalInterviews}</div>
              <div className="text-sm text-gray-600">Interviews</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Target className="w-6 h-6 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold text-purple-600">{reportData.totalOffers}</div>
              <div className="text-sm text-gray-600">Offers</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Award className="w-6 h-6 mx-auto mb-2 text-orange-600" />
              <div className="text-2xl font-bold text-orange-600">{reportData.totalHires}</div>
              <div className="text-sm text-gray-600">Hires</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <TrendingUp className="w-6 h-6 mx-auto mb-2 text-red-600" />
              <div className="text-2xl font-bold text-red-600">{reportData.successRate}%</div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
          </div>

          {/* Top Performers */}
          {reportData.topPerformers.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Award className="w-5 h-5" />
                Top Performers
              </h3>
              <div className="space-y-2">
                {reportData.topPerformers.slice(0, 3).map((performer, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant={index === 0 ? "default" : "secondary"}>
                        #{index + 1}
                      </Badge>
                      <span className="font-medium">{performer.name}</span>
                    </div>
                    <div className="flex gap-4 text-sm text-gray-600">
                      <span>{performer.interviews} interviews</span>
                      <span>{performer.offers} offers</span>
                      <span>{performer.hires} hires</span>
                      <span className="font-medium">{performer.ratio}% success</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Yesterday's Activity */}
          {reportData.yesterdayActivity.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Yesterday's Activity</h3>
              <div className="space-y-2">
                {reportData.yesterdayActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{activity.name}</span>
                    <div className="flex gap-4 text-sm text-gray-600">
                      <span>{activity.candidates_contacted} contacted</span>
                      <span>{activity.interviews} interviews</span>
                      <span>{activity.offers} offers</span>
                      <span>{activity.hires} hires</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
