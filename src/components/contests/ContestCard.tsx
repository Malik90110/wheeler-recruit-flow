
import React from 'react';
import { Trophy, Clock, Users, Target, Award, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Contest {
  id: string;
  title: string;
  description: string;
  rules: string[];
  startDate: Date;
  endDate: Date;
  status: 'active' | 'upcoming' | 'completed';
  targetMetrics: string[];
  prize: string;
  participants: number;
  createdBy: string;
}

interface ContestCardProps {
  contest: Contest;
  currentUser: string;
}

export const ContestCard = ({ contest, currentUser }: ContestCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'upcoming': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Trophy className="w-4 h-4" />;
      case 'upcoming': return <Clock className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      default: return <Trophy className="w-4 h-4" />;
    }
  };

  const getDaysRemaining = () => {
    const today = new Date();
    const endDate = contest.endDate;
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const daysRemaining = getDaysRemaining();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center space-x-2 mb-2">
              <span>{contest.title}</span>
              <Badge className={getStatusColor(contest.status)}>
                {getStatusIcon(contest.status)}
                <span className="ml-1 capitalize">{contest.status}</span>
              </Badge>
            </CardTitle>
            <p className="text-sm text-gray-600">{contest.description}</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <div>
              <div className="font-medium">Duration</div>
              <div className="text-gray-600">
                {formatDate(contest.startDate)} - {formatDate(contest.endDate)}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-gray-500" />
            <div>
              <div className="font-medium">Participants</div>
              <div className="text-gray-600">{contest.participants} joined</div>
            </div>
          </div>
        </div>

        {contest.status === 'active' && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2 text-blue-700">
              <Clock className="w-4 h-4" />
              <span className="font-medium">
                {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Contest ending soon!'}
              </span>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Target className="w-4 h-4 text-gray-500" />
            <span className="font-medium text-sm">Target Metrics:</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {contest.targetMetrics.map((metric) => (
              <Badge key={metric} variant="outline" className="text-xs">
                {metric}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Award className="w-4 h-4 text-yellow-600" />
            <span className="font-medium text-sm">Prize:</span>
          </div>
          <p className="text-sm text-gray-700 bg-yellow-50 p-2 rounded">{contest.prize}</p>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-sm">Rules:</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            {contest.rules.map((rule, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <span className="text-xs text-gray-500">
            Created by {contest.createdBy}
          </span>
          
          {contest.status === 'active' && (
            <Button size="sm">
              View Progress
            </Button>
          )}
          
          {contest.status === 'upcoming' && (
            <Button size="sm" variant="outline">
              Join Contest
            </Button>
          )}
          
          {contest.status === 'completed' && (
            <Button size="sm" variant="outline">
              View Results
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
