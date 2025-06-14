
import { useState, useEffect } from 'react';
import { getCurrentProfile, Profile } from '@/lib/supabase/client';
import { supabase } from '@/lib/supabase/client';

export const useAuth = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('Fast auth initialization...');
        
        // Get current session immediately
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

        // Set loading to false immediately if no session
        if (!session?.user) {
          console.log('No session found');
          if (mounted) {
            setProfile(null);
            setLoading(false);
            setInitialized(true);
          }
        } else {
          console.log('Session found, loading profile for user:', session.user.id);
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
        }

        // Set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
          console.log('Auth state changed:', event);
          
          if (!mounted) return;

          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            if (newSession?.user) {
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
            }
          } else if (event === 'SIGNED_OUT') {
            console.log('User signed out');
            if (mounted) {
              setProfile(null);
              setLoading(false);
              setInitialized(true);
            }
          }
        });

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
    loading,
    isAuthenticated: !!profile && initialized,
    isSuperAdmin: profile?.role === 'super_admin',
    isAdmin: profile?.role === 'admin' || profile?.role === 'super_admin'
  };
};
