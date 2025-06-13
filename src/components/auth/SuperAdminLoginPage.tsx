
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
        // Check user role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        console.log('Super admin profile data:', profile);

        if (profileError) {
          console.error('Profile fetch error:', profileError);
          throw new Error('Could not verify admin status');
        }

        if (profile?.role === 'super_admin') {
          console.log('Super admin login successful, redirecting to dashboard');
          navigate('/superadmin/dashboard');
        } else {
          throw new Error('Account does not have super admin privileges');
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full space-y-8 p-8 bg-black/40 backdrop-blur-xl border-amber-500/20">
        <div className="text-center">
          <div className="flex justify-center">
            <Crown className="h-12 w-12 text-amber-400 mb-4" />
          </div>
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-amber-400 to-purple-400 bg-clip-text text-transparent">
            Super Admin Login
          </h2>
          <p className="mt-2 text-gray-400">Access the super admin dashboard</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <Alert variant="destructive" className="bg-red-900/50 border-red-500/50 text-red-200">
              {error}
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
                className="bg-slate-800 border-amber-500/30 text-white placeholder-gray-400"
              />
            </div>
            <div>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="bg-slate-800 border-amber-500/30 text-white placeholder-gray-400"
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-600 to-purple-600 hover:from-amber-700 hover:to-purple-700"
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
