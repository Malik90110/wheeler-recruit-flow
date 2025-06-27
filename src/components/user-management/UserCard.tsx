
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserCheck, Trash2 } from 'lucide-react';
import { UserProfile } from './types';

interface UserCardProps {
  user: UserProfile;
  onDelete: (userId: string, userName: string) => void;
  deletingUser: string | null;
}

export const UserCard = ({ user, onDelete, deletingUser }: UserCardProps) => {
  return (
    <Card key={user.id}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">
              {user.first_name} {user.last_name}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <span>{user.email}</span>
              {user.roles && user.roles.length > 0 && (
                <div className="flex gap-1">
                  {user.roles.map((role, index) => (
                    <Badge key={index} variant={role === 'admin' ? 'destructive' : role === 'manager' ? 'default' : 'secondary'}>
                      {role}
                    </Badge>
                  ))}
                </div>
              )}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-green-500" />
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(user.id, `${user.first_name} ${user.last_name}`)}
              disabled={deletingUser === user.id}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {deletingUser === user.id ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500">
          Account created: {new Date(user.created_at).toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  );
};
