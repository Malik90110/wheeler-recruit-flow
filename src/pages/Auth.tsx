
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { LoginForm } from '@/components/auth/LoginForm';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
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

  const title = isLogin ? 'Welcome Back' : 'Create Account';
  const description = isLogin ? 'Sign in with your name' : 'Join the productivity tracker';
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
