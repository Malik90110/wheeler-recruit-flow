
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserProfile } from './types';

export const useUserManagement = (isManager: boolean) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingUser, setDeletingUser] = useState<string | null>(null);
  const { toast } = useToast();

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
      
      // Combine the data with proper null checks
      const usersWithRoles = profiles?.map(profile => {
        const roles = userRoles?.filter(role => role.user_id === profile.id).map(role => role.role) || [];
        
        // Add null check for authData and authData.users
        let email = 'No email';
        if (authData && authData.users) {
          const authUser = authData.users.find(user => user.id === profile.id);
          if (authUser && authUser.email) {
            email = authUser.email;
          }
        }
        
        return {
          ...profile,
          roles,
          email
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

  useEffect(() => {
    if (isManager) {
      fetchUsers();
    }
  }, [isManager]);

  return {
    users,
    loading,
    deletingUser,
    handleDeleteUser,
    fetchUsers
  };
};
