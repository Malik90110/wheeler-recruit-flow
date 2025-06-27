
import React from 'react';
import { useUserRoles } from '@/hooks/useUserRoles';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import { DailyReportTrigger } from './DailyReportTrigger';
import { AccessRestricted } from './user-management/AccessRestricted';
import { LoadingState } from './user-management/LoadingState';
import { UserList } from './user-management/UserList';
import { useUserManagement } from './user-management/useUserManagement';

export const UserManagement = () => {
  const { isManager } = useUserRoles();
  const { users, loading, deletingUser, handleDeleteUser } = useUserManagement(isManager);

  if (!isManager) {
    return <AccessRestricted />;
  }

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600">Manage user accounts and permissions</p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          {users.length} Users
        </Badge>
      </div>

      {/* Daily Report Trigger */}
      <div className="flex justify-center">
        <DailyReportTrigger />
      </div>

      <UserList
        users={users}
        onDeleteUser={handleDeleteUser}
        deletingUser={deletingUser}
      />
    </div>
  );
};
