
import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface Discrepancy {
  id: string;
  report_date: string;
  field_name: string;
  reported_value: number;
  logged_value: number;
  status: string;
  manager_notes: string | null;
  user_id: string;
  profiles?: {
    first_name: string;
    last_name: string;
  } | null;
}

export const DiscrepancyReview = () => {
  const { user } = useAuth();
  const [discrepancies, setDiscrepancies] = useState<Discrepancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDiscrepancy, setSelectedDiscrepancy] = useState<string | null>(null);
  const [managerNotes, setManagerNotes] = useState('');

  useEffect(() => {
    fetchDiscrepancies();
  }, []);

  const fetchDiscrepancies = async () => {
    try {
      const { data, error } = await supabase
        .from('activity_discrepancies')
        .select(`
          *,
          profiles!inner(first_name, last_name)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching discrepancies:', error);
        toast.error('Failed to load discrepancies');
        setDiscrepancies([]);
      } else {
        setDiscrepancies(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
      setDiscrepancies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDiscrepancyAction = async (discrepancyId: string, action: 'approved' | 'rejected') => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('activity_discrepancies')
        .update({
          status: action,
          manager_notes: managerNotes,
          resolved_by: user.id,
          resolved_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', discrepancyId);

      if (error) {
        console.error('Error updating discrepancy:', error);
        toast.error('Failed to update discrepancy');
      } else {
        toast.success(`Discrepancy ${action} successfully`);
        setSelectedDiscrepancy(null);
        setManagerNotes('');
        fetchDiscrepancies();
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to update discrepancy');
    }
  };

  const getFieldDisplayName = (fieldName: string) => {
    const names: { [key: string]: string } = {
      interviews_scheduled: 'Interviews Scheduled',
      offers_sent: 'Offers Sent',
      hires_made: 'Hires Made',
      candidates_contacted: 'Candidates Contacted'
    };
    return names[fieldName] || fieldName;
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
        Activity Discrepancies ({discrepancies.length})
      </h3>

      {discrepancies.length === 0 ? (
        <div className="text-center py-8">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <p className="text-gray-600">No pending discrepancies to review</p>
        </div>
      ) : (
        <div className="space-y-4">
          {discrepancies.map((discrepancy) => (
            <div key={discrepancy.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-medium text-gray-900">
                      {discrepancy.profiles 
                        ? `${discrepancy.profiles.first_name} ${discrepancy.profiles.last_name}`
                        : 'Unknown User'
                      }
                    </span>
                    <span className="text-sm text-gray-500">
                      • {new Date(discrepancy.report_date).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Field</p>
                      <p className="text-sm text-gray-900">{getFieldDisplayName(discrepancy.field_name)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">User Reported</p>
                      <p className="text-sm text-gray-900 font-semibold">{discrepancy.logged_value}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">System Report</p>
                      <p className="text-sm text-gray-900 font-semibold text-red-600">{discrepancy.reported_value}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-gray-600">Difference:</span>
                    <span className={`font-semibold ${
                      discrepancy.reported_value > discrepancy.logged_value 
                        ? 'text-red-600' 
                        : 'text-blue-600'
                    }`}>
                      {discrepancy.reported_value > discrepancy.logged_value ? '+' : ''}
                      {discrepancy.reported_value - discrepancy.logged_value}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedDiscrepancy(
                      selectedDiscrepancy === discrepancy.id ? null : discrepancy.id
                    )}
                  >
                    <MessageSquare className="w-4 h-4 mr-1" />
                    Review
                  </Button>
                </div>
              </div>

              {selectedDiscrepancy === discrepancy.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Manager Notes
                      </label>
                      <textarea
                        value={managerNotes}
                        onChange={(e) => setManagerNotes(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Add notes about this discrepancy..."
                      />
                    </div>
                    
                    <div className="flex space-x-3">
                      <Button
                        size="sm"
                        onClick={() => handleDiscrepancyAction(discrepancy.id, 'approved')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve User Entry
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDiscrepancyAction(discrepancy.id, 'rejected')}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject User Entry
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
