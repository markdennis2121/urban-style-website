
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { validateEmail, validatePassword, authRateLimiter, sanitizeText } from '@/lib/security';
import { Shield, Eye, EyeOff } from 'lucide-react';

const UserLoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

  const getOrCreateProfile = async (userId: string, userEmail: string) => {
    try {
      let { data: profiles, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .limit(1);

      if (fetchError) {
        console.error('Error fetching profile:', fetchError);
        throw fetchError;
      }

      if (profiles && profiles.length > 0) {
        console.log('Found existing profile:', profiles[0]);
        return profiles[0];
      }

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

    // Sanitize inputs
    const sanitizedEmail = sanitizeText(email);
    
    // Validate inputs
    if (!validateEmail(sanitizedEmail)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    // Check rate limiting
    if (!authRateLimiter.isAllowed(sanitizedEmail)) {
      const remaining = authRateLimiter.getRemainingTime(sanitizedEmail);
      setRateLimited(true);
      setRemainingTime(Math.ceil(remaining / 1000 / 60)); // Convert to minutes
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

      console.log('Auth successful, fetching profile...');

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

  const passwordValidation = validatePassword(password);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50">
      <Card className="w-full max-w-md p-8 bg-white/80 backdrop-blur-sm border border-gray-200 shadow-xl">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>
        
        {error && (
          <Alert variant="destructive" className="mb-4 bg-red-50 border-red-200">
            <span className="text-red-700">{error}</span>
          </Alert>
        )}
        
        {message && (
          <Alert className="mb-4 bg-blue-50 border-blue-200">
            <span className="text-blue-700">{message}</span>
            {error?.includes('verify your email') && (
              <Button
                variant="link"
                className="mt-2 w-full text-blue-600"
                onClick={handleResendVerification}
                disabled={loading}
              >
                Resend verification email
              </Button>
            )}
          </Alert>
        )}

        {rateLimited && (
          <Alert variant="destructive" className="mb-4">
            <div className="space-y-2">
              <p>Account temporarily locked due to too many failed attempts.</p>
              <Progress value={(15 - remainingTime) / 15 * 100} className="w-full" />
              <p className="text-sm">Unlocks in {remainingTime} minutes</p>
            </div>
          </Alert>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-12 rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              disabled={loading || rateLimited}
            />
          </div>
          
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full h-12 rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 pr-12"
              minLength={6}
              disabled={loading || rateLimited}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>

          {password && !passwordValidation.isValid && (
            <div className="text-sm text-red-600 space-y-1">
              <p className="font-medium">Password requirements:</p>
              <ul className="list-disc list-inside space-y-1">
                {passwordValidation.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-200"
            disabled={loading || rateLimited}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Button
            variant="link"
            onClick={() => navigate('/signup')}
            className="text-blue-600 hover:text-blue-700"
            disabled={loading}
          >
            Don't have an account? Sign up
          </Button>
        </div>

        <div className="mt-4 text-xs text-gray-500 text-center">
          <p>🔒 Your data is protected with enterprise-grade security</p>
        </div>
      </Card>
    </div>
  );
};

export default UserLoginPage;
