
import React from 'react';

interface MonthlyTrend {
  month: string;
  interviews: number;
  offers: number;
  hires: number;
}

interface MonthlyTrendsProps {
  monthlyTrends: MonthlyTrend[];
}

export const MonthlyTrends: React.FC<MonthlyTrendsProps> = ({ monthlyTrends }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Monthly Performance Trends</h3>
      {monthlyTrends.length > 0 ? (
        <div className="space-y-4">
          {monthlyTrends.map((period, index) => (
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
                    style={{ width: `${Math.min((period.interviews / Math.max(...monthlyTrends.map(m => m.interviews))) * 100, 100)}%` }}
                  ></div>
                </div>
                <div className="h-2 bg-green-200 rounded-full flex-1">
                  <div 
                    className="h-2 bg-green-500 rounded-full"
                    style={{ width: `${Math.min((period.offers / Math.max(...monthlyTrends.map(m => m.offers))) * 100, 100)}%` }}
                  ></div>
                </div>
                <div className="h-2 bg-purple-200 rounded-full flex-1">
                  <div 
                    className="h-2 bg-purple-500 rounded-full"
                    style={{ width: `${Math.min((period.hires / Math.max(...monthlyTrends.map(m => m.hires))) * 100, 100)}%` }}
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
  );
};
