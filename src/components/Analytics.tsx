
import React, { useState } from 'react';
import { BarChart, Users, Calendar, ArrowUp, ArrowDown } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';

export const Analytics = () => {
  const [timeFilter, setTimeFilter] = useState('monthly');
  const [recruiterFilter, setRecruiterFilter] = useState('all');
  const { data, loading } = useAnalytics(timeFilter, recruiterFilter);

  if (loading) {
    return (
      <div className="max-w-6xl space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="animate-pulse">
                <div className="h-12 bg-gray-200 rounded mb-4"></div>
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Performance Analytics</h1>
          <p className="text-gray-600 mt-1">Team performance insights and trends</p>
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mt-4 lg:mt-0">
          <select 
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
          </select>
          
          <select 
            value={recruiterFilter}
            onChange={(e) => setRecruiterFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Recruiters</option>
            {data.teamData.map((member, index) => (
              <option key={index} value={member.name.toLowerCase().replace(' ', '')}>
                {member.name}
              </option>
            ))}
          </select>
        </div>
      </div>

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
          <h3 className="text-2xl font-bold text-gray-900 mt-4">{data.totalInterviews.toLocaleString()}</h3>
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
          <h3 className="text-2xl font-bold text-gray-900 mt-4">{data.totalOffers.toLocaleString()}</h3>
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
          <h3 className="text-2xl font-bold text-gray-900 mt-4">{data.totalHires.toLocaleString()}</h3>
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
          <h3 className="text-2xl font-bold text-gray-900 mt-4">{data.successRate}%</h3>
          <p className="text-gray-600 text-sm">Success Rate</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Monthly Performance Trends</h3>
          {data.monthlyTrends.length > 0 ? (
            <div className="space-y-4">
              {data.monthlyTrends.map((month, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">{month.month}</span>
                    <div className="flex space-x-4 text-sm text-gray-600">
                      <span>{month.interviews}I</span>
                      <span>{month.offers}O</span>
                      <span>{month.hires}H</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <div className="h-2 bg-blue-200 rounded-full flex-1">
                      <div 
                        className="h-2 bg-blue-500 rounded-full"
                        style={{ width: `${Math.min((month.interviews / Math.max(...data.monthlyTrends.map(m => m.interviews))) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <div className="h-2 bg-green-200 rounded-full flex-1">
                      <div 
                        className="h-2 bg-green-500 rounded-full"
                        style={{ width: `${Math.min((month.offers / Math.max(...data.monthlyTrends.map(m => m.offers))) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <div className="h-2 bg-purple-200 rounded-full flex-1">
                      <div 
                        className="h-2 bg-purple-500 rounded-full"
                        style={{ width: `${Math.min((month.hires / Math.max(...data.monthlyTrends.map(m => m.hires))) * 100, 100)}%` }}
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

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Team Performance Ranking</h3>
          {data.teamData.length > 0 ? (
            <div className="space-y-4">
              {data.teamData.sort((a, b) => b.ratio - a.ratio).map((recruiter, index) => (
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
      </div>
    </div>
  );
};
