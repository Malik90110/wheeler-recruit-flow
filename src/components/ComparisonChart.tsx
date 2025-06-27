
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { TrendingUp, Users, Briefcase, UserCheck, Phone, Send } from 'lucide-react';

interface ComparisonData {
  field_name: string;
  user_logged: number;
  excel_reported: number;
  employee_name: string;
  difference: number;
}

const chartConfig = {
  user_logged: {
    label: "User Logged",
    color: "#3b82f6", // blue
  },
  excel_reported: {
    label: "Excel Report",
    color: "#ef4444", // red
  },
};

export const ComparisonChart = () => {
  const { user } = useAuth();
  const [comparisonData, setComparisonData] = useState<ComparisonData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchComparisonData();
      
      // Set up real-time subscription for activity logs
      const activityChannel = supabase
        .channel('activity-logs-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'activity_logs'
          },
          () => {
            console.log('Activity logs changed, refreshing chart data');
            fetchComparisonData();
          }
        )
        .subscribe();

      // Set up real-time subscription for production reports
      const reportsChannel = supabase
        .channel('production-reports-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'production_report_entries'
          },
          () => {
            console.log('Production report entries changed, refreshing chart data');
            fetchComparisonData();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(activityChannel);
        supabase.removeChannel(reportsChannel);
      };
    }
  }, [user]);

  const fetchComparisonData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];

      console.log('Fetching comparison data for user:', user.id, 'date:', today);

      // Get user's activity log for today
      const { data: activityData, error: activityError } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      if (activityError && activityError.code !== 'PGRST116') {
        console.error('Error fetching activity data:', activityError);
        return;
      }

      console.log('Activity data:', activityData);

      // Get user's profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return;
      }

      console.log('Profile data:', profileData);

      // Get production report entries for today
      const { data: reportEntries, error: reportError } = await supabase
        .from('production_report_entries')
        .select(`
          *,
          production_reports!inner(report_date)
        `)
        .eq('production_reports.report_date', today);

      if (reportError) {
        console.error('Error fetching report entries:', reportError);
        return;
      }

      console.log('All report entries for today:', reportEntries);

      // Create comparison data
      const comparisonData: ComparisonData[] = [];
      
      if (activityData && reportEntries && reportEntries.length > 0) {
        // Create proper case user name for display
        const userName = `${profileData.first_name.charAt(0).toUpperCase() + profileData.first_name.slice(1).toLowerCase()} ${profileData.last_name.charAt(0).toUpperCase() + profileData.last_name.slice(1).toLowerCase()}`;
        console.log('Looking for user name:', userName);
        
        // Create normalized names for comparison (case-insensitive)
        const normalizeString = (str: string) => str.toLowerCase().trim().replace(/\s+/g, ' ');
        const userNameNormalized = normalizeString(userName);
        
        console.log('Normalized user name for matching:', userNameNormalized);
        
        // Find matching report entry with case-insensitive exact matching
        const reportEntry = reportEntries.find(entry => {
          if (!entry.employee_name) return false;
          
          const entryNameNormalized = normalizeString(entry.employee_name);
          console.log('Comparing with entry:', entry.employee_name, '-> normalized:', entryNameNormalized);
          
          // Exact match (case-insensitive)
          const isMatch = entryNameNormalized === userNameNormalized;
          console.log('Match result:', isMatch);
          
          return isMatch;
        });

        console.log('Found matching report entry:', reportEntry);
        
        if (reportEntry) {
          const fields = [
            { name: 'Interviews Scheduled', userField: 'interviews_scheduled', reportField: 'interviews_scheduled' },
            { name: 'Offers Sent', userField: 'offers_sent', reportField: 'offers_sent' },
            { name: 'Hires Made', userField: 'hires_made', reportField: 'hires_made' },
            { name: 'Candidates Contacted', userField: 'candidates_contacted', reportField: 'candidates_contacted' },
            { name: 'Onboarding Sent', userField: 'onboarding_sent', reportField: 'onboarding_sent' }
          ];

          fields.forEach(field => {
            const userValue = Number(activityData[field.userField as keyof typeof activityData]) || 0;
            const reportValue = Number(reportEntry[field.reportField as keyof typeof reportEntry]) || 0;
            
            console.log(`${field.name}: User=${userValue}, Report=${reportValue}`);
            
            comparisonData.push({
              field_name: field.name,
              user_logged: userValue,
              excel_reported: reportValue,
              employee_name: userName,
              difference: reportValue - userValue
            });
          });
        } else {
          console.log('No matching report entry found for user:', userName);
          console.log('Available employee names:', reportEntries.map(e => e.employee_name));
          
          // Create comparison data with zeros for Excel values to show user data
          const fields = [
            { name: 'Interviews Scheduled', userField: 'interviews_scheduled' },
            { name: 'Offers Sent', userField: 'offers_sent' },
            { name: 'Hires Made', userField: 'hires_made' },
            { name: 'Candidates Contacted', userField: 'candidates_contacted' },
            { name: 'Onboarding Sent', userField: 'onboarding_sent' }
          ];

          fields.forEach(field => {
            const userValue = Number(activityData[field.userField as keyof typeof activityData]) || 0;
            
            comparisonData.push({
              field_name: field.name,
              user_logged: userValue,
              excel_reported: 0,
              employee_name: userName,
              difference: 0 - userValue
            });
          });
        }
      } else {
        console.log('Missing data - Activity:', !!activityData, 'Report entries:', reportEntries?.length || 0);
      }

      setComparisonData(comparisonData);
      console.log('Final comparison data:', comparisonData);
    } catch (error) {
      console.error('Error fetching comparison data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFieldIcon = (fieldName: string) => {
    switch (fieldName) {
      case 'Interviews Scheduled':
        return <Briefcase className="w-4 h-4" />;
      case 'Offers Sent':
        return <Users className="w-4 h-4" />;
      case 'Hires Made':
        return <UserCheck className="w-4 h-4" />;
      case 'Candidates Contacted':
        return <Phone className="w-4 h-4" />;
      case 'Onboarding Sent':
        return <Send className="w-4 h-4" />;
      default:
        return <TrendingUp className="w-4 h-4" />;
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-blue-600">
              <span className="font-medium">User Logged:</span> {data.user_logged}
            </p>
            <p className="text-red-600">
              <span className="font-medium">Excel Report:</span> {data.excel_reported}
            </p>
            <p className={`font-medium ${data.difference > 0 ? 'text-red-600' : data.difference < 0 ? 'text-green-600' : 'text-gray-600'}`}>
              <span>Difference:</span> {data.difference > 0 ? '+' : ''}{data.difference}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (comparisonData.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
          Data Comparison Chart
        </h3>
        <div className="text-center py-8">
          <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No comparison data available</p>
          <p className="text-sm text-gray-500 mt-1">
            Upload a production report and log your activities to see the comparison
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
        Real-Time Data Comparison
      </h3>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Comparing your logged activities with Excel report data for today
        </p>
      </div>

      <ChartContainer config={chartConfig} className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="field_name" 
              tick={{ fontSize: 12 }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              dataKey="user_logged" 
              fill="var(--color-user_logged)" 
              name="User Logged"
              radius={[2, 2, 0, 0]}
            />
            <Bar 
              dataKey="excel_reported" 
              fill="var(--color-excel_reported)" 
              name="Excel Report"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
        {comparisonData.map((item, index) => (
          <div key={index} className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                {getFieldIcon(item.field_name)}
                <span className="text-xs font-medium text-gray-700 ml-1">
                  {item.field_name.split(' ')[0]}
                </span>
              </div>
              <span className={`text-xs font-bold ${
                item.difference > 0 ? 'text-red-600' : 
                item.difference < 0 ? 'text-green-600' : 'text-gray-600'
              }`}>
                {item.difference > 0 ? '+' : ''}{item.difference}
              </span>
            </div>
            <div className="text-xs text-gray-600">
              You: {item.user_logged} | Excel: {item.excel_reported}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
