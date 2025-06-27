
import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Dashboard } from '@/components/Dashboard';
import { ActivityLogger } from '@/components/ActivityLogger';
import { Chat } from '@/components/Chat';
import { BulletinBoard } from '@/components/BulletinBoard';
import { Analytics } from '@/components/Analytics';
import { Contests } from '@/components/Contests';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState('');
  const { user, session, loading, signOut } = useAuth();
  const navigate = useNavigate();

  // Redirect to auth if not authenticated
  useEffect(() => {
    console.log('Index: Checking auth state', { loading, session: !!session, user: user?.email });
    
    if (!loading && !session) {
      console.log('Index: No session found, redirecting to auth');
      navigate('/auth');
    }
  }, [session, loading, navigate]);

  // Fetch user profile when authenticated
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        console.log('Index: Fetching profile for user:', user.email);
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          setCurrentUser(`${profile.first_name} ${profile.last_name}`);
        } else {
          // Fallback to email if no profile
          setCurrentUser(user.email || 'User');
        }
      }
    };

    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const handleSignOut = async () => {
    console.log('Index: User signing out');
    await signOut();
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-blue-600 rounded-lg mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show nothing while redirecting to auth
  if (!session) {
    return null;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard currentUser={currentUser} />;
      case 'logger':
        return <ActivityLogger currentUser={currentUser} />;
      case 'analytics':
        return <Analytics />;
      case 'contests':
        return <Contests currentUser={currentUser} />;
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
        <div className="h-full flex flex-col">
          <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-white">
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {currentUser}!
            </h1>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
          <div className="flex-1 p-6">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
