import React, { useState, useEffect } from 'react';
import { Plus, Save, Calendar, TrendingUp, Users, Briefcase, UserCheck, Upload, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ProductionReportUpload } from './ProductionReportUpload';
import { DiscrepancyReview } from './DiscrepancyReview';
import { ComparisonChart } from './ComparisonChart';

interface ActivityLoggerProps {
  currentUser: string;
}

interface TodayStats {
  interviews_scheduled: number;
  offers_sent: number;
  hires_made: number;
  candidates_contacted: number;
  notes: string;
}

export const ActivityLogger = ({ currentUser }: ActivityLoggerProps) => {
  const { user } = useAuth();
  const [activities, setActivities] = useState({
    interviewsScheduled: '',
    offersSent: '',
    hiresMade: '',
    candidatesContacted: '',
    notes: ''
  });
  const [todayStats, setTodayStats] = useState<TodayStats>({
    interviews_scheduled: 0,
    offers_sent: 0,
    hires_made: 0,
    candidates_contacted: 0,
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'logger' | 'upload' | 'discrepancies'>('logger');
  const [pendingDiscrepancies, setPendingDiscrepancies] = useState(0);

  useEffect(() => {
    if (user) {
      fetchTodayStats();
      fetchPendingDiscrepancies();
    }
  }, [user]);

  const fetchTodayStats = async () => {
    if (!user) return;
    
    setStatsLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching today stats:', error);
      } else if (data) {
        setTodayStats({
          interviews_scheduled: data.interviews_scheduled || 0,
          offers_sent: data.offers_sent || 0,
          hires_made: data.hires_made || 0,
          candidates_contacted: data.candidates_contacted || 0,
          notes: data.notes || ''
        });
        
        // Pre-populate form with existing data - ensure proper string conversion
        setActivities({
          interviewsScheduled: (data.interviews_scheduled || 0).toString(),
          offersSent: (data.offers_sent || 0).toString(),
          hiresMade: (data.hires_made || 0).toString(),
          candidatesContacted: (data.candidates_contacted || 0).toString(),
          notes: data.notes || ''
        });
      }
    } catch (error) {
      console.error('Error fetching today stats:', error);
    }
    setStatsLoading(false);
  };

  const fetchPendingDiscrepancies = async () => {
    if (!user) return;

    try {
      const { count, error } = await supabase
        .from('activity_discrepancies')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (error) {
        console.error('Error fetching discrepancies count:', error);
      } else {
        setPendingDiscrepancies(count || 0);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setActivities(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to save activities');
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('activity_logs')
        .upsert({
          user_id: user.id,
          date: new Date().toISOString().split('T')[0], // Today's date
          interviews_scheduled: parseInt(activities.interviewsScheduled) || 0,
          offers_sent: parseInt(activities.offersSent) || 0,
          hires_made: parseInt(activities.hiresMade) || 0,
          candidates_contacted: parseInt(activities.candidatesContacted) || 0,
          notes: activities.notes || null,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,date'
        });

      if (error) {
        console.error('Error saving activities:', error);
        toast.error('Failed to save activities');
      } else {
        toast.success('Activities saved successfully!');
        // Refresh today's stats after saving
        fetchTodayStats();
      }
    } catch (error) {
      console.error('Error saving activities:', error);
      toast.error('Failed to save activities');
    }
    
    setLoading(false);
  };

  const getConversionRate = () => {
    if (todayStats.interviews_scheduled === 0) return 0;
    return ((todayStats.hires_made / todayStats.interviews_scheduled) * 100).toFixed(1);
  };

  const handleUploadComplete = () => {
    fetchPendingDiscrepancies();
    toast.success('Report processed successfully!');
  };

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Activity Logger</h1>
          <p className="text-gray-600 mt-1">Track your daily recruiting activities and upload production reports</p>
        </div>
        <div className="flex items-center space-x-2 text-gray-600">
          <Calendar className="w-5 h-5" />
          <span className="font-medium">{new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('logger')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'logger'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Activity Logger
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'upload'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Upload className="w-4 h-4 inline mr-1" />
            Upload Report
          </button>
          <button
            onClick={() => setActiveTab('discrepancies')}
            className={`py-2 px-1 border-b-2 font-medium text-sm relative ${
              activeTab === 'discrepancies'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <AlertTriangle className="w-4 h-4 inline mr-1" />
            Discrepancies
            {pendingDiscrepancies > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {pendingDiscrepancies}
              </span>
            )}
          </button>
        </nav>
      </div>

      {activeTab === 'logger' && (
        <div className="space-y-6">
          {/* Comparison Chart */}
          <ComparisonChart />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Daily Analytics Tracker */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                  Today's Analytics
                </h2>
                
                {statsLoading ? (
                  <div className="space-y-4">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-8 bg-gray-200 rounded"></div>
                    </div>
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-8 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center">
                        <Briefcase className="w-4 h-4 text-blue-600 mr-2" />
                        <span className="text-sm font-medium text-gray-700">Interviews</span>
                      </div>
                      <span className="text-2xl font-bold text-blue-600">{todayStats.interviews_scheduled}</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 text-purple-600 mr-2" />
                        <span className="text-sm font-medium text-gray-700">Offers Sent</span>
                      </div>
                      <span className="text-2xl font-bold text-purple-600">{todayStats.offers_sent}</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center">
                        <UserCheck className="w-4 h-4 text-green-600 mr-2" />
                        <span className="text-sm font-medium text-gray-700">Hires Made</span>
                      </div>
                      <span className="text-2xl font-bold text-green-600">{todayStats.hires_made}</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 text-orange-600 mr-2" />
                        <span className="text-sm font-medium text-gray-700">Contacted</span>
                      </div>
                      <span className="text-2xl font-bold text-orange-600">{todayStats.candidates_contacted}</span>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Conversion Rate</span>
                        <span className="text-lg font-bold text-gray-900">{getConversionRate()}%</span>
                      </div>
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${Math.min(parseFloat(getConversionRate().toString()), 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {todayStats.notes && (
                      <div className="pt-4 border-t border-gray-200">
                        <p className="text-sm font-medium text-gray-700 mb-2">Today's Notes:</p>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{todayStats.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Activity Logger Form */}
            <div className="lg:col-span-2">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <Plus className="w-5 h-5 mr-2 text-blue-600" />
                  Log Today's Activities
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Interviews Scheduled
                      </label>
                      <input
                        type="number"
                        value={activities.interviewsScheduled}
                        onChange={(e) => handleInputChange('interviewsScheduled', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Offers Sent
                      </label>
                      <input
                        type="number"
                        value={activities.offersSent}
                        onChange={(e) => handleInputChange('offersSent', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hires Made
                      </label>
                      <input
                        type="number"
                        value={activities.hiresMade}
                        onChange={(e) => handleInputChange('hiresMade', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Candidates Contacted
                      </label>
                      <input
                        type="number"
                        value={activities.candidatesContacted}
                        onChange={(e) => handleInputChange('candidatesContacted', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={activities.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Any additional notes about today's activities..."
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <Save className="w-5 h-5" />
                    <span>{loading ? 'Saving...' : 'Save Activities'}</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'upload' && (
        <ProductionReportUpload onUploadComplete={handleUploadComplete} />
      )}

      {activeTab === 'discrepancies' && (
        <DiscrepancyReview />
      )}
    </div>
  );
};
