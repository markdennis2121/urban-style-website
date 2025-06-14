
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { Shield } from 'lucide-react';

const AdminLoginPage = () => {
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
      console.log('Admin login attempt for:', email);
      
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error('Admin login error:', signInError);
        throw signInError;
      }

      if (data.user) {
        // Check user role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        console.log('Admin profile check:', profile);

        if (profileError) {
          console.error('Profile fetch error:', profileError);
          throw new Error('Could not verify admin status');
        }

        if (profile?.role === 'admin' || profile?.role === 'super_admin') {
          console.log('Admin login successful, redirecting to dashboard');
          navigate('/admin/dashboard');
        } else {
          throw new Error('Invalid account type or insufficient permissions');
        }
      }
    } catch (err) {
      console.error('Admin login error:', err);
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
            <div className="w-16 h-16 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-primary to-foreground bg-clip-text text-transparent">
            Admin Login
          </h2>
          <p className="mt-2 text-muted-foreground">Access the admin dashboard</p>
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
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
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

export default AdminLoginPage;
