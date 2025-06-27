
import React from 'react';

interface AnalyticsHeaderProps {
  dataSource: 'production' | 'activity_logs';
  recruiterFilter: string;
  onRecruiterFilterChange: (value: string) => void;
  teamData: Array<{ name: string }>;
}

export const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({
  dataSource,
  recruiterFilter,
  onRecruiterFilterChange,
  teamData
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Performance Analytics</h1>
        <p className="text-gray-600 mt-1">Your performance insights and team trends</p>
        <p className="text-sm text-gray-500 mt-1">
          Personal data source: {dataSource === 'production' ? 'Production Report' : 'Activity Logs'}
        </p>
      </div>
      
      <div className="mt-4 lg:mt-0">
        <select 
          value={recruiterFilter}
          onChange={(e) => onRecruiterFilterChange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Recruiters</option>
          {teamData.map((member, index) => (
            <option key={index} value={member.name.toLowerCase().replace(' ', '')}>
              {member.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
