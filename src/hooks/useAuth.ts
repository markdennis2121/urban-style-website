
import { useState, useEffect } from 'react';
import { getCurrentProfile, Profile } from '@/lib/supabase/client';
import { supabase } from '@/lib/supabase/client';

export const useAuth = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;

    const handleAuthSession = async (session: any) => {
      if (!mounted) return;

      if (session?.user) {
        console.log('Processing session for user:', session.user.id);
        try {
          const userProfile = await getCurrentProfile();
          if (mounted) {
            console.log('Profile loaded:', userProfile);
            setProfile(userProfile);
            setLoading(false);
            setInitialized(true);
          }
        } catch (error) {
          console.error('Error getting profile:', error);
          if (mounted) {
            setProfile(null);
            setLoading(false);
            setInitialized(true);
          }
        }
      } else {
        console.log('No session found, clearing profile');
        if (mounted) {
          setProfile(null);
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    // Get initial session immediately
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting initial session:', error);
          if (mounted) {
            setProfile(null);
            setLoading(false);
            setInitialized(true);
          }
          return;
        }
        
        console.log('Initial session:', session?.user?.id || 'No session');
        await handleAuthSession(session);
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        if (mounted) {
          setProfile(null);
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (!mounted) return;

      // Skip INITIAL_SESSION since we handle it manually above
      if (event === 'INITIAL_SESSION') {
        return;
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        await handleAuthSession(session);
      } else if (event === 'SIGNED_OUT' || !session) {
        console.log('User signed out');
        if (mounted) {
          setProfile(null);
          setLoading(false);
          setInitialized(true);
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
    loading: loading && !initialized,
    isAuthenticated: !!profile,
    isSuperAdmin: profile?.role === 'super_admin',
    isAdmin: profile?.role === 'admin' || profile?.role === 'super_admin'
  };
};
