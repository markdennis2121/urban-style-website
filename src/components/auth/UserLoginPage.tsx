import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';

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

  const getOrCreateProfile = async (userId: string, userEmail: string) => {
    try {
      // First, try to get existing profile
      let { data: profiles, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .limit(1);

      if (fetchError) {
        console.error('Error fetching profile:', fetchError);
        throw fetchError;
      }

      // If profile exists, return the first one
      if (profiles && profiles.length > 0) {
        console.log('Found existing profile:', profiles[0]);
        return profiles[0];
      }

      // If no profile exists, create one
      console.log('No profile found, creating new profile...');
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert([
          {
            id: userId,
            email: userEmail,
            username: userEmail.split('@')[0],
            role: 'user'
          }
        ])
        .select('*')
        .single();

      if (createError) {
        console.error('Error creating profile:', createError);
        throw createError;
      }

      console.log('Created new profile:', newProfile);
      return newProfile;
    } catch (error) {
      console.error('Error in getOrCreateProfile:', error);
      throw error;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      console.log('Attempting login with:', { email });
      
      // Try to sign in
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
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

      console.log('Auth successful, fetching profile...');

      // Get or create profile
      const profileData = await getOrCreateProfile(authData.user.id, authData.user.email || '');

      if (!profileData) {
        throw new Error('No profile data found');
      }

      console.log('Login successful, user role:', profileData.role);

      // Redirect based on role
      if (profileData.role === 'super_admin') {
        navigate('/superadmin/dashboard');
      } else if (profileData.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }

    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">User Login</h1>
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            {error}
          </Alert>
        )}
        
        {message && (
          <Alert className="mb-4">
            {message}
            {error?.includes('verify your email') && (
              <Button
                variant="link"
                className="mt-2 w-full"
                onClick={handleResendVerification}
                disabled={loading}
              >
                Resend verification email
              </Button>
            )}
          </Alert>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full"
            />
          </div>
          
          <div>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full"
              minLength={6}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <Button
            variant="link"
            onClick={() => navigate('/signup')}
            className="text-sm"
          >
            Don't have an account? Sign up
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default UserLoginPage;
