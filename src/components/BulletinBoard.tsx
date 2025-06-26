
import React, { useState } from 'react';
import { Users, Calendar, MessageSquare } from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  date: Date;
  priority: 'high' | 'medium' | 'low';
  category: string;
}

export const BulletinBoard = () => {
  const [announcements] = useState<Announcement[]>([]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Strategy': return 'bg-blue-100 text-blue-800';
      case 'Training': return 'bg-purple-100 text-purple-800';
      case 'Administrative': return 'bg-gray-100 text-gray-800';
      case 'Events': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Company Bulletin Board</h1>
          <p className="text-gray-600 mt-1">Important announcements and updates</p>
        </div>
        <div className="flex items-center space-x-2 text-gray-600">
          <Users className="w-5 h-5" />
          <span className="font-medium">Leadership Updates</span>
        </div>
      </div>

      {announcements.length === 0 ? (
        <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-200 text-center">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Announcements Yet</h2>
          <p className="text-gray-600">Check back later for important company updates and announcements.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {announcements.map((announcement) => (
            <div key={announcement.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h2 className="text-xl font-semibold text-gray-900">{announcement.title}</h2>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(announcement.priority)}`}>
                      {announcement.priority.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                    <span className="flex items-center space-x-1">
                      <MessageSquare className="w-4 h-4" />
                      <span>{announcement.author}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{announcement.date.toLocaleDateString()}</span>
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(announcement.category)}`}>
                      {announcement.category}
                    </span>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-700 leading-relaxed">{announcement.content}</p>
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Posted {announcement.date.toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Read More
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <div className="flex items-center space-x-2 text-blue-800 mb-2">
          <MessageSquare className="w-5 h-5" />
          <h3 className="font-semibold">Need to post an announcement?</h3>
        </div>
        <p className="text-blue-700 text-sm">
          Contact leadership or HR to have important updates posted to the bulletin board.
        </p>
      </div>
    </div>
  );
};
