
import { useState, useEffect } from 'react';
import { getCurrentProfile, Profile } from '@/lib/supabase/client';
import { supabase } from '@/lib/supabase/client';

export const useAuth = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const getInitialSession = async () => {
      try {
        // Get the current session first
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          if (mounted) {
            setProfile(null);
            setLoading(false);
          }
          return;
        }

        if (session?.user) {
          // User has a valid session, get their profile
          const userProfile = await getCurrentProfile();
          if (mounted) {
            setProfile(userProfile);
          }
        } else {
          // No session, user is not authenticated
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
        }
      }
    };

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          const userProfile = await getCurrentProfile();
          if (mounted) {
            setProfile(userProfile);
            setLoading(false);
          }
        } catch (error) {
          console.error('Error getting profile after sign in:', error);
          if (mounted) {
            setProfile(null);
            setLoading(false);
          }
        }
      } else if (event === 'SIGNED_OUT' || !session) {
        if (mounted) {
          setProfile(null);
          setLoading(false);
        }
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        // Token was refreshed, maintain the current profile
        console.log('Token refreshed, maintaining session');
        if (mounted && !profile) {
          try {
            const userProfile = await getCurrentProfile();
            setProfile(userProfile);
          } catch (error) {
            console.error('Error getting profile after token refresh:', error);
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
  }, []);

  return {
    profile,
    loading,
    isAuthenticated: !!profile,
    isSuperAdmin: profile?.role === 'super_admin',
    isAdmin: profile?.role === 'admin' || profile?.role === 'super_admin'
  };
};
