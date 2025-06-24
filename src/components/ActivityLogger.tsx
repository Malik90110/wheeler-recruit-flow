
import React, { useState } from 'react';
import { Plus, Save, Calendar } from 'lucide-react';

interface ActivityLoggerProps {
  currentUser: string;
}

export const ActivityLogger = ({ currentUser }: ActivityLoggerProps) => {
  const [activities, setActivities] = useState({
    interviewsScheduled: '',
    offersSent: '',
    hiresMade: '',
    candidatesContacted: '',
    notes: ''
  });

  const [recentEntries] = useState([
    {
      date: '2024-12-20',
      interviews: 3,
      offers: 2,
      hires: 1,
      candidates: 8,
      notes: 'Strong day with quality candidates'
    },
    {
      date: '2024-12-19',
      interviews: 2,
      offers: 1,
      hires: 0,
      candidates: 6,
      notes: 'Follow-up needed on pending offers'
    }
  ]);

  const handleInputChange = (field: string, value: string) => {
    setActivities(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Saving activities:', activities);
    // Here you would typically save to a database
    setActivities({
      interviewsScheduled: '',
      offersSent: '',
      hiresMade: '',
      candidatesContacted: '',
      notes: ''
    });
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Activity Logger</h1>
          <p className="text-gray-600 mt-1">Track your daily recruiting activities</p>
        </div>
        <div className="flex items-center space-x-2 text-gray-600">
          <Calendar className="w-5 h-5" />
          <span className="font-medium">{new Date().toLocaleDateString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Save className="w-5 h-5" />
              <span>Save Activities</span>
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Entries</h2>
          
          <div className="space-y-4">
            {recentEntries.map((entry, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-medium text-gray-900">
                    {new Date(entry.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Interviews:</span>
                    <span className="font-medium text-blue-600">{entry.interviews}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Offers:</span>
                    <span className="font-medium text-green-600">{entry.offers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hires:</span>
                    <span className="font-medium text-purple-600">{entry.hires}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Candidates:</span>
                    <span className="font-medium text-orange-600">{entry.candidates}</span>
                  </div>
                </div>
                
                {entry.notes && (
                  <p className="text-sm text-gray-600 mt-3 italic">"{entry.notes}"</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
