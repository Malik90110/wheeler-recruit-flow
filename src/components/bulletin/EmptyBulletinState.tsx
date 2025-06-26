
import React from 'react';
import { MessageSquare } from 'lucide-react';

export const EmptyBulletinState = () => {
  return (
    <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-200 text-center">
      <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
      <h2 className="text-xl font-semibold text-gray-900 mb-2">No Announcements Yet</h2>
      <p className="text-gray-600">Be the first to post an important company update or announcement.</p>
    </div>
  );
};
