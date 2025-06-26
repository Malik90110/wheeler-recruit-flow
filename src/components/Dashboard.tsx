
import React, { useState, useEffect } from 'react';
import { Users, Calendar, MessageSquare, ArrowUp } from 'lucide-react';

interface DashboardProps {
  currentUser: string;
}

export const Dashboard = ({ currentUser }: DashboardProps) => {
  const [metrics, setMetrics] = useState({
    interviewsScheduled: 0,
    offersSent: 0,
    hiresMade: 0,
    totalCandidates: 0,
    interviewToHireRatio: 0
  });

  const [weeklyTrend] = useState([
    { day: 'Mon', interviews: 0, offers: 0, hires: 0 },
    { day: 'Tue', interviews: 0, offers: 0, hires: 0 },
    { day: 'Wed', interviews: 0, offers: 0, hires: 0 },
    { day: 'Thu', interviews: 0, offers: 0, hires: 0 },
    { day: 'Fri', interviews: 0, offers: 0, hires: 0 },
  ]);

  const metricCards = [
    {
      title: 'Interviews Scheduled',
      value: metrics.interviewsScheduled,
      icon: Calendar,
      color: 'bg-blue-500',
      change: '0%'
    },
    {
      title: 'Offers Sent',
      value: metrics.offersSent,
      icon: MessageSquare,
      color: 'bg-green-500',
      change: '0%'
    },
    {
      title: 'Hires Made',
      value: metrics.hiresMade,
      icon: Users,
      color: 'bg-purple-500',
      change: '0%'
    },
    {
      title: 'Interview-to-Hire Ratio',
      value: `${metrics.interviewToHireRatio}%`,
      icon: ArrowUp,
      color: 'bg-orange-500',
      change: '0%'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {currentUser}</h1>
          <p className="text-gray-600 mt-1">Here's your recruiting performance overview</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Current Week</p>
          <p className="text-lg font-semibold text-gray-900">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-lg ${card.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-600">{card.change}</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mt-4">{card.value}</h3>
              <p className="text-gray-600 text-sm">{card.title}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Activity Trend</h3>
          <div className="space-y-4">
            {weeklyTrend.map((day, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600 w-12">{day.day}</span>
                <div className="flex-1 mx-4">
                  <div className="flex space-x-2">
                    <div className="h-2 bg-blue-200 rounded-full flex-1">
                      <div 
                        className="h-2 bg-blue-500 rounded-full"
                        style={{ width: `${day.interviews > 0 ? (day.interviews / 5) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <div className="h-2 bg-green-200 rounded-full flex-1">
                      <div 
                        className="h-2 bg-green-500 rounded-full"
                        style={{ width: `${day.offers > 0 ? (day.offers / 3) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <div className="h-2 bg-purple-200 rounded-full flex-1">
                      <div 
                        className="h-2 bg-purple-500 rounded-full"
                        style={{ width: `${day.hires > 0 ? (day.hires / 2) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-4 text-sm text-gray-600">
                  <span>{day.interviews}I</span>
                  <span>{day.offers}O</span>
                  <span>{day.hires}H</span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center space-x-6 mt-4 text-xs text-gray-500">
            <span className="flex items-center"><div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>Interviews</span>
            <span className="flex items-center"><div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>Offers</span>
            <span className="flex items-center"><div className="w-3 h-3 bg-purple-500 rounded-full mr-1"></div>Hires</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full p-4 text-left bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors">
              <h4 className="font-medium text-blue-900">Log Today's Activities</h4>
              <p className="text-sm text-blue-700 mt-1">Record interviews, offers, and hires</p>
            </button>
            <button className="w-full p-4 text-left bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors">
              <h4 className="font-medium text-green-900">View Team Performance</h4>
              <p className="text-sm text-green-700 mt-1">Compare metrics across recruiters</p>
            </button>
            <button className="w-full p-4 text-left bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors">
              <h4 className="font-medium text-purple-900">Check Team Messages</h4>
              <p className="text-sm text-purple-700 mt-1">Stay updated with team chat</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
