
import React, { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Dashboard } from '@/components/Dashboard';
import { ActivityLogger } from '@/components/ActivityLogger';
import { Chat } from '@/components/Chat';
import { BulletinBoard } from '@/components/BulletinBoard';
import { Analytics } from '@/components/Analytics';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentUser] = useState('John Smith'); // In real app, this would come from auth

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard currentUser={currentUser} />;
      case 'logger':
        return <ActivityLogger currentUser={currentUser} />;
      case 'analytics':
        return <Analytics />;
      case 'chat':
        return <Chat currentUser={currentUser} />;
      case 'bulletin':
        return <BulletinBoard />;
      default:
        return <Dashboard currentUser={currentUser} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 overflow-hidden">
        <div className="h-full p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Index;
