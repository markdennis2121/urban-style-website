
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { Alert } from '@/components/ui/alert';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Processing auth callback...');
        
        // Get the URL parameters
        const params = new URLSearchParams(window.location.search);
        console.log('URL parameters:', Object.fromEntries(params.entries()));

        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log('Session status:', { session, sessionError });

        if (sessionError) {
          throw new Error(`Session error: ${sessionError.message}`);
        }

        if (!session) {
          throw new Error('No session found');
        }

        // Get the current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        console.log('User status:', { user, userError });

        if (userError) {
          throw new Error(`User error: ${userError.message}`);
        }

        if (!user) {
          throw new Error('No user found after authentication');
        }

        // Wait a moment for the trigger to create the profile
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Check user profile and role
        let { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        console.log('Profile status:', { profile, profileError });

        if (profileError || !profile) {
          console.log('Attempting to create profile...');
          // Try to create the profile manually if it doesn't exist
          const { error: insertError } = await supabase
            .from('profiles')
            .insert([
              {
                id: user.id,
                email: user.email,
                username: user.email?.split('@')[0] || 'user',
                role: 'user'
              }
            ]);

          if (insertError) {
            throw new Error(`Failed to create profile: ${insertError.message}`);
          }

          // Fetch the profile again
          const { data: newProfile, error: newProfileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (newProfileError || !newProfile) {
            throw new Error('Failed to fetch newly created profile');
          }

          profile = newProfile;
        }

        // Sign out the user first so they need to log in manually
        await supabase.auth.signOut();

        // Redirect based on role
        console.log('Redirecting user with role:', profile.role);
        if (profile.role === 'super_admin') {
          navigate('/superadmin/login', {
            state: {
              message: 'Email confirmed! Please log in to access your Super Admin dashboard.'
            }
          });
        } else if (profile.role === 'admin') {
          navigate('/admin/login', {
            state: {
              message: 'Email confirmed! Please log in to access your Admin dashboard.'
            }
          });
        } else {
          navigate('/login', {
            state: {
              message: 'Email confirmed successfully! Please log in to continue.'
            }
          });
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        navigate('/login', { 
          state: { 
            error: err instanceof Error ? err.message : 'There was an error processing your verification'
          } 
        });
      }
    };

    handleAuthCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          {error}
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-4">
      <Alert>
        Processing your email confirmation...
      </Alert>
    </div>
  );
};

export default AuthCallback;
