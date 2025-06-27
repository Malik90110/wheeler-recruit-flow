
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserRoles } from '@/hooks/useUserRoles';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Users, Shield, UserCheck } from 'lucide-react';
import { DailyReportTrigger } from './DailyReportTrigger';

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  created_at: string;
  roles?: string[];
  email?: string;
}

export const UserManagement = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingUser, setDeletingUser] = useState<string | null>(null);
  const { isManager, isAdmin } = useUserRoles();
  const { toast } = useToast();

  useEffect(() => {
    if (isManager) {
      fetchUsers();
    }
  }, [isManager]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Fetch auth users to get emails
      const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
      
      // Combine the data
      const usersWithRoles = profiles?.map(profile => {
        const roles = userRoles?.filter(role => role.user_id === profile.id).map(role => role.role) || [];
        const authUser = authData?.users?.find(user => user.id === profile.id);
        return {
          ...profile,
          roles,
          email: authUser?.email || 'No email'
        };
      }) || [];

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete ${userName}? This action cannot be undone and will remove all their data.`)) {
      return;
    }

    setDeletingUser(userId);
    
    try {
      const { data, error } = await supabase.rpc('delete_user_profile', {
        _user_id: userId
      });

      if (error) throw error;

      if (data) {
        toast({
          title: "User Deleted",
          description: `${userName} has been successfully deleted.`,
        });
        
        // Refresh the users list
        await fetchUsers();
      } else {
        throw new Error('Failed to delete user profile');
      }
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingUser(null);
    }
  };

  if (!isManager) {
    return (
      <div className="text-center py-8">
        <Shield className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
        <p className="text-gray-500">You need manager or admin privileges to access user management.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="w-8 h-8 bg-blue-600 rounded-lg mx-auto mb-4 animate-pulse"></div>
        <p className="text-gray-600">Loading users...</p>
      </div>
    );
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

      <div className="grid gap-4">
        {users.map((user) => (
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
                    onClick={() => handleDeleteUser(user.id, `${user.first_name} ${user.last_name}`)}
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
        ))}
      </div>

      {users.length === 0 && (
        <div className="text-center py-8">
          <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Users Found</h3>
          <p className="text-gray-500">There are no users in the system yet.</p>
        </div>
      )}
    </div>
  );
};
