
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { Crown } from 'lucide-react';

const SuperAdminLoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log('Attempting super admin login with:', email);
      
      // First attempt to sign in
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error('Super admin login error:', signInError);
        // Check if we need to resend verification email
        if (signInError.message.includes('Email not confirmed')) {
          const { error: resendError } = await supabase.auth.resend({
            type: 'signup',
            email,
          });
          if (resendError) {
            console.error('Error resending verification:', resendError);
          }
          throw new Error('Please verify your email first. A new verification email has been sent.');
        }
        throw signInError;
      }

      console.log('Auth successful, checking role...');

      if (data.user) {
        // Wait a moment for auth state to settle
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Check user role with multiple attempts
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, email, id')
          .eq('id', data.user.id)
          .single();

        console.log('Super admin profile data:', profile);
        console.log('Profile fetch error:', profileError);

        if (profileError) {
          console.error('Profile fetch error:', profileError);
          // Try alternative query without RLS restrictions
          const { data: altProfile, error: altError } = await supabase
            .from('profiles')
            .select('role, email, id')
            .eq('email', email)
            .single();
          
          console.log('Alternative profile query result:', altProfile, altError);
          
          if (altError) {
            throw new Error('Could not verify admin status - profile not found');
          }
          
          // Use alternative profile if main query failed (using standardized role name)
          if (altProfile && altProfile.role === 'superadmin') {
            console.log('Super admin login successful via alternative query, redirecting to dashboard');
            navigate('/superadmin/dashboard');
            return;
          } else {
            throw new Error(`Account does not have super admin privileges. Current role: ${altProfile?.role || 'unknown'}`);
          }
        }

        // Check for superadmin role (using standardized role name)
        if (profile?.role === 'superadmin') {
          console.log('Super admin login successful, redirecting to dashboard');
          navigate('/superadmin/dashboard');
        } else {
          throw new Error(`Account does not have super admin privileges. Current role: ${profile?.role || 'unknown'}`);
        }
      }
    } catch (err) {
      console.error('Super admin login error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/10 to-background py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full space-y-8 p-8 bg-card/80 backdrop-blur-md border border-border/50 shadow-xl">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-r from-amber-500/20 to-primary/20 rounded-full flex items-center justify-center mb-4">
              <Crown className="h-8 w-8 text-amber-500" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-amber-500 via-primary to-amber-600 bg-clip-text text-transparent">
            Super Admin Login
          </h2>
          <p className="mt-2 text-muted-foreground">Access the super admin dashboard</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <Alert variant="destructive" className="bg-destructive/10 border-destructive/20">
              <span className="text-destructive">{error}</span>
            </Alert>
          )}
          <div className="space-y-4">
            <div>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="bg-background/50 border-border/50 text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="bg-background/50 border-border/50 text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 to-primary hover:from-amber-600 hover:to-primary/90 text-white"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default SuperAdminLoginPage;
