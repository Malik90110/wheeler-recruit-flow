
import React from 'react';
import { Play, Pause, Square, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Contest {
  id: string;
  title: string;
  status: 'active' | 'upcoming' | 'completed' | 'paused';
  start_date: string;
  end_date: string;
}

interface ContestManagementProps {
  contest: Contest;
  onStart: (contestId: string) => Promise<boolean>;
  onPause: (contestId: string) => Promise<boolean>;
  onEnd: (contestId: string) => Promise<boolean>;
  isManager: boolean;
}

export const ContestManagement = ({ 
  contest, 
  onStart, 
  onPause, 
  onEnd, 
  isManager 
}: ContestManagementProps) => {
  if (!isManager) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'upcoming': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-gray-100 text-gray-700';
      case 'paused': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleStart = async () => {
    const success = await onStart(contest.id);
    if (success) {
      console.log(`Contest ${contest.title} started successfully`);
    }
  };

  const handlePause = async () => {
    const success = await onPause(contest.id);
    if (success) {
      console.log(`Contest ${contest.title} paused successfully`);
    }
  };

  const handleEnd = async () => {
    const success = await onEnd(contest.id);
    if (success) {
      console.log(`Contest ${contest.title} ended successfully`);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Badge className={getStatusColor(contest.status)}>
        <Clock className="w-3 h-3 mr-1" />
        {contest.status.charAt(0).toUpperCase() + contest.status.slice(1)}
      </Badge>

      {contest.status === 'upcoming' && (
        <Button size="sm" onClick={handleStart} className="flex items-center space-x-1">
          <Play className="w-3 h-3" />
          <span>Start</span>
        </Button>
      )}

      {contest.status === 'active' && (
        <>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handlePause}
            className="flex items-center space-x-1"
          >
            <Pause className="w-3 h-3" />
            <span>Pause</span>
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="destructive" className="flex items-center space-x-1">
                <Square className="w-3 h-3" />
                <span>End</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>End Contest</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to end "{contest.title}"? This action cannot be undone and the contest will be marked as completed.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleEnd}>End Contest</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}

      {contest.status === 'paused' && (
        <>
          <Button size="sm" onClick={handleStart} className="flex items-center space-x-1">
            <Play className="w-3 h-3" />
            <span>Resume</span>
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="destructive" className="flex items-center space-x-1">
                <Square className="w-3 h-3" />
                <span>End</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>End Contest</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to end "{contest.title}"? This action cannot be undone and the contest will be marked as completed.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleEnd}>End Contest</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
};
