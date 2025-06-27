
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { LoginForm } from '@/components/auth/LoginForm';
import { useAuth } from '@/contexts/AuthContext';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { session, loading: authLoading } = useAuth();

  useEffect(() => {
    console.log('Auth: Checking if user is already logged in', { session: !!session, authLoading });
    
    // If user is already logged in, redirect to main page
    if (!authLoading && session) {
      console.log('Auth: User already logged in, redirecting to main page');
      navigate('/');
    }
  }, [session, authLoading, navigate]);

  // Show loading while checking auth state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-blue-600 rounded-lg mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render auth form if user is already authenticated
  if (session) {
    return null;
  }

  const title = isLogin ? 'Welcome Back' : 'Create Account';
  const description = isLogin ? 'Sign in to your account' : 'Join the productivity tracker';
  const switchText = isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in";

  return (
    <AuthLayout
      title={title}
      description={description}
      switchText={switchText}
      onSwitchClick={() => setIsLogin(!isLogin)}
    >
      {isLogin ? (
        <LoginForm loading={loading} setLoading={setLoading} />
      ) : (
        <SignUpForm loading={loading} setLoading={setLoading} />
      )}
    </AuthLayout>
  );
};

export default Auth;
