
import React, { useState } from 'react';
import { Trophy, Clock, Users, Medal, Plus, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContestCard } from '@/components/contests/ContestCard';
import { CreateContestDialog } from '@/components/contests/CreateContestDialog';
import { ContestLeaderboard } from '@/components/contests/ContestLeaderboard';
import { ContestManagement } from '@/components/contests/ContestManagement';
import { useContests } from '@/hooks/useContests';

interface ContestsProps {
  currentUser: string;
}

export const Contests = ({ currentUser }: ContestsProps) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { contests, loading, startContest, pauseContest, endContest, refreshContests } = useContests();

  // Mock user role - will come from Supabase auth/profiles
  const isManager = currentUser === 'Sarah Johnson' || currentUser === 'Mike Chen';

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="animate-pulse">
                <div className="h-12 bg-gray-200 rounded mb-4"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const activeContests = contests.filter(c => c.status === 'active');
  const upcomingContests = contests.filter(c => c.status === 'upcoming');
  const completedContests = contests.filter(c => c.status === 'completed');
  const pausedContests = contests.filter(c => c.status === 'paused');

  const handleContestCreated = () => {
    refreshContests();
  };

  const renderContestList = (contestList: typeof contests, showManagement = true) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {contestList.map((contest) => (
        <div key={contest.id} className="space-y-4">
          <ContestCard contest={contest} currentUser={currentUser} />
          {showManagement && isManager && (
            <ContestManagement
              contest={contest}
              onStart={startContest}
              onPause={pauseContest}
              onEnd={endContest}
              isManager={isManager}
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderEmptyState = (icon: React.ReactNode, title: string, description: string, showCreateButton = false) => (
    <Card>
      <CardContent className="text-center py-12">
        {icon}
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500">{description}</p>
        {showCreateButton && isManager && (
          <Button 
            onClick={() => setShowCreateDialog(true)}
            className="mt-4"
          >
            Create Contest
          </Button>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Trophy className="w-8 h-8 text-yellow-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Team Contests</h1>
            <p className="text-gray-600">Drive engagement and boost performance</p>
          </div>
        </div>
        
        {isManager && (
          <Button onClick={() => setShowCreateDialog(true)} className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Create Contest</span>
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Contests</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{activeContests.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {activeContests.reduce((sum, contest) => sum + contest.participants, 0)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{upcomingContests.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paused</CardTitle>
            <Medal className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pausedContests.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Contest Tabs */}
      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="active" className="flex items-center space-x-2">
            <Trophy className="w-4 h-4" />
            <span>Active ({activeContests.length})</span>
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>Upcoming ({upcomingContests.length})</span>
          </TabsTrigger>
          <TabsTrigger value="paused" className="flex items-center space-x-2">
            <Medal className="w-4 h-4" />
            <span>Paused ({pausedContests.length})</span>
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center space-x-2">
            <Medal className="w-4 h-4" />
            <span>Completed ({completedContests.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6">
          {activeContests.length > 0 ? (
            renderContestList(activeContests)
          ) : (
            renderEmptyState(
              <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />,
              "No Active Contests",
              "Create your first contest to get started!",
              true
            )
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-6">
          {upcomingContests.length > 0 ? (
            renderContestList(upcomingContests)
          ) : (
            renderEmptyState(
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />,
              "No Upcoming Contests",
              "Stay tuned for new challenges!"
            )
          )}
        </TabsContent>

        <TabsContent value="paused" className="space-y-6">
          {pausedContests.length > 0 ? (
            renderContestList(pausedContests)
          ) : (
            renderEmptyState(
              <Medal className="w-12 h-12 text-gray-400 mx-auto mb-4" />,
              "No Paused Contests",
              "Contests that are paused will appear here."
            )
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-6">
          {completedContests.length > 0 ? (
            renderContestList(completedContests, false)
          ) : (
            renderEmptyState(
              <Medal className="w-12 h-12 text-gray-400 mx-auto mb-4" />,
              "No Completed Contests",
              "Completed contests will appear here."
            )
          )}
        </TabsContent>
      </Tabs>

      <CreateContestDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog}
        onContestCreated={handleContestCreated}
      />
    </div>
  );
};
