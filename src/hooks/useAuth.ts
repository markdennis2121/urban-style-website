
import { useState, useEffect } from 'react';
import { getCurrentProfile, Profile } from '@/lib/supabase/client';
import { supabase } from '@/lib/supabase/client';

export const useAuth = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;
    let sessionProcessed = false;

    const handleAuthSession = async (session: any) => {
      if (!mounted || sessionProcessed) return;

      console.log('handleAuthSession called with session:', session?.user?.id || 'null');
      
      if (session?.user) {
        sessionProcessed = true;
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

    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        
        // Get current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (mounted) {
            setProfile(null);
            setLoading(false);
            setInitialized(true);
          }
          return;
        }

        console.log('Initial session check:', session?.user?.id || 'No session');
        
        // Process the session
        await handleAuthSession(session);

        // Set up the auth state listener AFTER processing initial session
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
          console.log('Auth state changed:', event, newSession?.user?.id || 'null');
          
          if (!mounted) return;

          // Reset the session processed flag for new auth events
          if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
            sessionProcessed = false;
          }

          // Skip INITIAL_SESSION since we already handled it above
          if (event === 'INITIAL_SESSION') {
            return;
          }

          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            await handleAuthSession(newSession);
          } else if (event === 'SIGNED_OUT') {
            console.log('User signed out');
            if (mounted) {
              setProfile(null);
              setLoading(false);
              setInitialized(true);
            }
          }
        });

        // Store subscription for cleanup
        return subscription;
        
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setProfile(null);
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    // Start initialization
    let subscription: any;
    initializeAuth().then((sub) => {
      subscription = sub;
    });

    // Cleanup function
    return () => {
      mounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  return {
    profile,
    loading: loading && !initialized,
    isAuthenticated: !!profile && initialized,
    isSuperAdmin: profile?.role === 'super_admin',
    isAdmin: profile?.role === 'admin' || profile?.role === 'super_admin'
  };
};
