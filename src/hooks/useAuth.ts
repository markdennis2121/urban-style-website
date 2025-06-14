
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
        setLoading(true);
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

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (!mounted) return;

      // Handle all session events including INITIAL_SESSION
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
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
