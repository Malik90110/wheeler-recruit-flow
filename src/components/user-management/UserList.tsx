
import React from 'react';
import { Users } from 'lucide-react';
import { UserCard } from './UserCard';
import { UserProfile } from './types';

interface UserListProps {
  users: UserProfile[];
  onDeleteUser: (userId: string, userName: string) => void;
  deletingUser: string | null;
}

export const UserList = ({ users, onDeleteUser, deletingUser }: UserListProps) => {
  if (users.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Users Found</h3>
        <p className="text-gray-500">There are no users in the system yet.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {users.map((user) => (
        <UserCard
          key={user.id}
          user={user}
          onDelete={onDeleteUser}
          deletingUser={deletingUser}
        />
      ))}
    </div>
  );
};
