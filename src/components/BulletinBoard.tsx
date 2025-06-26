
import React from 'react';
import { BulletinHeader } from './bulletin/BulletinHeader';
import { AnnouncementCard } from './bulletin/AnnouncementCard';
import { EmptyBulletinState } from './bulletin/EmptyBulletinState';
import { useBulletinAnnouncements } from './bulletin/useBulletinAnnouncements';

export const BulletinBoard = () => {
  const { announcements, loading, currentUser, fetchAnnouncements } = useBulletinAnnouncements();

  if (loading) {
    return (
      <div className="max-w-4xl space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <BulletinHeader 
        currentUser={currentUser} 
        onAnnouncementCreated={fetchAnnouncements}
      />

      {announcements.length === 0 ? (
        <EmptyBulletinState />
      ) : (
        <div className="grid gap-6">
          {announcements.map((announcement) => (
            <AnnouncementCard key={announcement.id} announcement={announcement} />
          ))}
        </div>
      )}
    </div>
  );
};
