import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { validateEmail, validatePassword, authRateLimiter, sanitizeText } from '@/lib/security';
import { Shield, Eye, EyeOff, KeyRound } from 'lucide-react';

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
  
  // Forgot password states
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState<string | null>(null);
  const [forgotPasswordError, setForgotPasswordError] = useState<string | null>(null);

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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotPasswordLoading(true);
    setForgotPasswordError(null);
    setForgotPasswordMessage(null);

    // Sanitize and validate email
    const sanitizedEmail = sanitizeText(forgotPasswordEmail);
    
    if (!validateEmail(sanitizedEmail)) {
      setForgotPasswordError('Please enter a valid email address');
      setForgotPasswordLoading(false);
      return;
    }

    // Check rate limiting for password reset
    if (!authRateLimiter.isAllowed(`reset_${sanitizedEmail}`)) {
      const remaining = authRateLimiter.getRemainingTime(`reset_${sanitizedEmail}`);
      setForgotPasswordError(`Too many password reset attempts. Please try again in ${Math.ceil(remaining / 1000 / 60)} minutes.`);
      setForgotPasswordLoading(false);
      return;
    }

    try {
      console.log('Sending password reset email to:', sanitizedEmail);
      
      const { error } = await supabase.auth.resetPasswordForEmail(sanitizedEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setForgotPasswordMessage('Password reset email sent! Please check your inbox and follow the instructions.');
      
      // Close dialog after a delay
      setTimeout(() => {
        setForgotPasswordOpen(false);
        setForgotPasswordEmail('');
        setForgotPasswordMessage(null);
      }, 3000);

    } catch (err) {
      console.error('Password reset error:', err);
      setForgotPasswordError(err instanceof Error ? err.message : 'Failed to send password reset email');
    } finally {
      setForgotPasswordLoading(false);
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
            <span className="text-destructive-foreground font-medium">{error}</span>
          </Alert>
        )}
        
        {message && (
          <Alert className="mb-6 bg-muted border-border">
            <span className="text-muted-foreground font-medium">{message}</span>
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
          </Alert>
        )}

        {rateLimited && (
          <Alert variant="destructive" className="mb-6">
            <div className="space-y-3">
              <p className="font-medium">Account temporarily locked due to too many failed attempts.</p>
              <Progress value={(15 - remainingTime) / 15 * 100} className="w-full" />
              <p className="text-sm">Unlocks in {remainingTime} minutes</p>
            </div>
          </Alert>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-12"
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
              className="w-full h-12 pr-12"
              minLength={6}
              disabled={loading || rateLimited}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>

          {password && !passwordValidation.isValid && (
            <div className="text-sm text-destructive bg-destructive/10 p-4 rounded-md space-y-2">
              <p className="font-semibold">Password requirements:</p>
              <ul className="list-disc list-inside space-y-1">
                {passwordValidation.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            disabled={loading || rateLimited}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
            <DialogTrigger asChild>
              <Button
                variant="link"
                className="text-primary hover:text-primary/80 font-medium"
                disabled={loading}
              >
                <KeyRound className="h-4 w-4 mr-2" />
                Forgot your password?
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <KeyRound className="h-5 w-5" />
                  Reset Password
                </DialogTitle>
              </DialogHeader>
              
              {forgotPasswordError && (
                <Alert variant="destructive" className="mb-4">
                  <span className="text-destructive-foreground font-medium">{forgotPasswordError}</span>
                </Alert>
              )}
              
              {forgotPasswordMessage && (
                <Alert className="mb-4 bg-green-500/10 border-green-500/20 text-green-600">
                  <span className="font-medium">{forgotPasswordMessage}</span>
                </Alert>
              )}

              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    required
                    className="w-full"
                    disabled={forgotPasswordLoading}
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    We'll send you a link to reset your password.
                  </p>
                </div>
                
                <Button
                  type="submit"
                  className="w-full"
                  disabled={forgotPasswordLoading}
                >
                  {forgotPasswordLoading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
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
