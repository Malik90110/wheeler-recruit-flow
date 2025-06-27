
import React from 'react';
import { Calendar, Users, BarChart, ArrowUp, ArrowDown } from 'lucide-react';

interface UserMetrics {
  totalInterviews: number;
  totalOffers: number;
  totalHires: number;
  totalOnboarding: number;
  dataSource: 'production' | 'activity_logs';
}

interface MetricsCardsProps {
  userMetrics: UserMetrics;
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({ userMetrics }) => {
  const successRate = userMetrics.totalInterviews > 0 ? 
    Number(((userMetrics.totalHires / userMetrics.totalInterviews) * 100).toFixed(1)) : 0;

  return (
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
  );
};
