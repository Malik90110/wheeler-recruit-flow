
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
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
}

export const DailyReportDisplay = () => {
  const [reportData, setReportData] = useState<DailyReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchDailyReport = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('daily-report', {
        body: { displayOnly: true }
      });

      if (error) throw error;

      if (data?.reportData) {
        setReportData({
          ...data.reportData,
          reportDate: new Date().toLocaleDateString()
        });
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

  useEffect(() => {
    fetchDailyReport();
  }, []);

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
