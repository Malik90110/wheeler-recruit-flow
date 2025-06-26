
import React from 'react';
import { Users } from 'lucide-react';
import { CreateAnnouncementDialog } from './CreateAnnouncementDialog';

interface BulletinHeaderProps {
  currentUser: string;
  onAnnouncementCreated: () => void;
}

export const BulletinHeader = ({ currentUser, onAnnouncementCreated }: BulletinHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Company Bulletin Board</h1>
        <p className="text-gray-600 mt-1">Important announcements and updates</p>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-gray-600">
          <Users className="w-5 h-5" />
          <span className="font-medium">Leadership Updates</span>
        </div>
        <CreateAnnouncementDialog 
          currentUser={currentUser} 
          onAnnouncementCreated={onAnnouncementCreated}
        />
      </div>
    </div>
  );
};
