
import React from 'react';

interface TeamMember {
  name: string;
  interviews: number;
  offers: number;
  hires: number;
  ratio: number;
}

interface TeamRankingProps {
  teamData: TeamMember[];
}

export const TeamRanking: React.FC<TeamRankingProps> = ({ teamData }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Team Performance Ranking</h3>
      {teamData.length > 0 ? (
        <div className="space-y-4">
          {teamData.sort((a, b) => b.ratio - a.ratio).map((recruiter, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                  index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-blue-500'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{recruiter.name}</p>
                  <p className="text-sm text-gray-500">{recruiter.hires} hires this month</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{recruiter.ratio}%</p>
                <p className="text-xs text-gray-500">Success Rate</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-8">
          <p>No team data available</p>
          <p className="text-sm">Team members will appear here once they start logging activities</p>
        </div>
      )}
    </div>
  );
};
