import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { validateEmail, authRateLimiter, sanitizeText } from '@/lib/security';
import { Shield, AlertCircle } from 'lucide-react';
import LoginForm from './LoginForm';
import ForgotPasswordDialog from './ForgotPasswordDialog';
import RateLimitAlert from './RateLimitAlert';

const UserLoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(
    location.state?.message || null
  );
  const [rateLimited, setRateLimited] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);

  const handleResendVerification = async () => {
    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      
      if (resendError) throw resendError;
      
      setMessage('Verification email has been resent. Please check your inbox.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend verification email');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const sanitizedEmail = sanitizeText(email);
    
    if (!validateEmail(sanitizedEmail)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    if (!authRateLimiter.isAllowed(sanitizedEmail)) {
      const remaining = authRateLimiter.getRemainingTime(sanitizedEmail);
      setRateLimited(true);
      setRemainingTime(Math.ceil(remaining / 1000 / 60));
      setError(`Too many login attempts. Please try again in ${Math.ceil(remaining / 1000 / 60)} minutes.`);
      setLoading(false);
      return;
    }

    try {
      console.log('Attempting login with:', { email: sanitizedEmail });
      
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password,
      });
      
      if (signInError) {
        console.error('Login error:', signInError);
        
        if (signInError.message.includes('Email not confirmed')) {
          setError('Please verify your email address first.');
          setMessage('Would you like to resend the verification email?');
          return;
        }
        
        if (signInError.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please check your credentials and try again.');
          return;
        }
        
        throw signInError;
      }

      if (!authData.user) {
        throw new Error('No user data returned');
      }

      console.log('Auth successful, checking profile...');

      // Wait for the profile to be created/fetched
      await new Promise(resolve => setTimeout(resolve, 1000));

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError || !profile) {
        console.error('Profile error:', profileError);
        throw new Error('Could not load user profile');
      }

      console.log('Login successful, user role:', profile.role);

      // Check if admin or super_admin is trying to login through user login
      if (profile.role === 'admin' || profile.role === 'super_admin') {
        await supabase.auth.signOut();
        setError('Please use the appropriate login page for your account type.');
        setLoading(false);
        return;
      }

      // Only allow regular users to proceed
      if (profile.role === 'user') {
        console.log('Regular user login successful, redirecting to home');
        navigate('/');
      } else {
        throw new Error('Invalid account type for user login');
      }

    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-background">
      <Card className="w-full max-w-md p-8 border shadow-lg">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome Back
          </h1>
          <p className="text-muted-foreground">Sign in to your account</p>
        </div>
        
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <div className="ml-3">
              <span className="font-medium text-destructive-foreground">{error}</span>
            </div>
          </Alert>
        )}
        
        {message && (
          <Alert className="mb-6 bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
            <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <div className="ml-3">
              <span className="font-medium text-blue-800 dark:text-blue-200">{message}</span>
              {error?.includes('verify your email') && (
                <Button
                  variant="link"
                  className="mt-3 w-full text-primary hover:text-primary/80 font-medium"
                  onClick={handleResendVerification}
                  disabled={loading}
                >
                  Resend verification email
                </Button>
              )}
            </div>
          </Alert>
        )}

        {rateLimited && (
          <RateLimitAlert remainingTime={remainingTime} />
        )}

        <LoginForm
          email={email}
          password={password}
          loading={loading}
          rateLimited={rateLimited}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onSubmit={handleLogin}
        />

        <div className="mt-6 text-center">
          <ForgotPasswordDialog disabled={loading} />
        </div>

        <div className="mt-6 text-center">
          <Button
            variant="link"
            onClick={() => navigate('/signup')}
            className="text-primary hover:text-primary/80 font-medium"
            disabled={loading}
          >
            Don't have an account? Sign up
          </Button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
            <Shield className="h-4 w-4" />
            Your data is protected with enterprise-grade security
          </p>
        </div>
      </Card>
    </div>
  );
};

export default UserLoginPage;
