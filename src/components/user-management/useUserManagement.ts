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

      // Try to get auth users, but handle the case where it might fail
      let authUsers: any[] = [];
      try {
        const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
        if (!authError && authData?.users) {
          authUsers = authData.users;
        }
      } catch (error) {
        console.log('Could not fetch auth users:', error);
      }

      // Combine the data with proper type checking
      const usersWithRoles = profiles?.map(profile => {
        // Filter roles for this specific user
        const userSpecificRoles = userRoles?.filter(role => role.user_id === profile.id) || [];
        const roles = userSpecificRoles.map(role => role.role);
        
        // Find auth user email
        let email = 'No email';
        if (authUsers.length > 0) {
          const authUser = authUsers.find(user => user?.id === profile.id);
          if (authUser?.email) {
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
