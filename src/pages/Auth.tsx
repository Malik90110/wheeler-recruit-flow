
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    password: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        navigate('/');
      }
    };
    checkUser();
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // For sign-up, we'll use the user's first name as part of the email
      // since we're not asking for email explicitly
      const email = `${formData.firstName.toLowerCase()}.${formData.lastName.toLowerCase()}@${Date.now()}.temp.com`;
      
      const { error } = await supabase.auth.signUp({
        email: email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName
          },
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Account created successfully!');
        navigate('/');
      }
    } catch (error) {
      toast.error('An error occurred during sign-up');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // For login, we need to find the user by their first and last name
      // and then use their email to sign in
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .ilike('first_name', formData.firstName)
        .ilike('last_name', formData.lastName);

      if (profileError || !profiles || profiles.length === 0) {
        toast.error('User not found. Please check your name and try again.');
        setLoading(false);
        return;
      }

      if (profiles.length > 1) {
        toast.error('Multiple users found with this name. Please contact support.');
        setLoading(false);
        return;
      }

      // Get the user's email from auth.users table using the profile id
      const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(profiles[0].id);
      
      if (userError || !user) {
        // Fallback: construct email the same way we do for signup
        const email = `${formData.firstName.toLowerCase()}.${formData.lastName.toLowerCase()}@${Date.now()}.temp.com`;
        
        const { error } = await supabase.auth.signInWithPassword({
          email: email,
          password: formData.password
        });

        if (error) {
          toast.error('Invalid credentials. Please check your name and password.');
        } else {
          toast.success('Logged in successfully!');
          navigate('/');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: user.email!,
          password: formData.password
        });

        if (error) {
          toast.error('Invalid credentials. Please check your name and password.');
        } else {
          toast.success('Logged in successfully!');
          navigate('/');
        }
      }
    } catch (error) {
      toast.error('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">W</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Wheeler Staffing</h1>
          </div>
          <CardTitle>{isLogin ? 'Welcome Back' : 'Create Account'}</CardTitle>
          <CardDescription>
            {isLogin ? 'Sign in with your name' : 'Join the productivity tracker'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={isLogin ? handleLogin : handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                placeholder="Enter your first name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                placeholder="Enter your last name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                placeholder="Enter your password"
                minLength={6}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
