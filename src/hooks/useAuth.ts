
import { useState, useEffect } from 'react';
import { getCurrentProfile, Profile } from '@/lib/supabase/client';
import { supabase } from '@/lib/supabase/client';

export const useAuth = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;

    const getInitialSession = async () => {
      try {
        console.log('Getting initial session...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          if (mounted) {
            setProfile(null);
            setLoading(false);
            setInitialized(true);
          }
          return;
        }

        if (session?.user) {
          console.log('Session found, getting profile...');
          const userProfile = await getCurrentProfile();
          if (mounted) {
            setProfile(userProfile);
          }
        } else {
          console.log('No session found');
          if (mounted) {
            setProfile(null);
          }
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        if (mounted) {
          setProfile(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (!mounted) return;

      if (event === 'SIGNED_IN' && session?.user) {
        console.log('User signed in, getting profile...');
        setLoading(true);
        try {
          const userProfile = await getCurrentProfile();
          if (mounted) {
            setProfile(userProfile);
            setLoading(false);
            setInitialized(true);
          }
        } catch (error) {
          console.error('Error getting profile after sign in:', error);
          if (mounted) {
            setProfile(null);
            setLoading(false);
            setInitialized(true);
          }
        }
      } else if (event === 'SIGNED_OUT' || !session) {
        console.log('User signed out');
        if (mounted) {
          setProfile(null);
          setLoading(false);
          setInitialized(true);
        }
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        console.log('Token refreshed');
        if (mounted && !profile) {
          try {
            const userProfile = await getCurrentProfile();
            if (mounted) {
              setProfile(userProfile);
              setInitialized(true);
            }
          } catch (error) {
            console.error('Error getting profile after token refresh:', error);
            if (mounted) {
              setInitialized(true);
            }
          }
        }
      }
    });

    // Get initial session
    getInitialSession();

    // Cleanup
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array to prevent re-running

  return {
    profile,
    loading: loading && !initialized,
    isAuthenticated: !!profile,
    isSuperAdmin: profile?.role === 'super_admin',
    isAdmin: profile?.role === 'admin' || profile?.role === 'super_admin'
  };
};
