
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
        console.log('Instant auth check...');
        
        // Get current session immediately - this is synchronous if cached
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

        // If we have a session, immediately set loading to false and get profile
        if (session?.user) {
          console.log('User already authenticated, loading profile instantly...');
          if (mounted) {
            setLoading(false); // Set loading false immediately
            setInitialized(true);
          }
          
          try {
            const userProfile = await getCurrentProfile();
            if (mounted) {
              console.log('Profile loaded:', userProfile);
              setProfile(userProfile);
            }
          } catch (error) {
            console.error('Error getting profile:', error);
            if (mounted) {
              setProfile(null);
            }
          }
        } else {
          console.log('No session found');
          if (mounted) {
            setProfile(null);
            setLoading(false);
            setInitialized(true);
          }
        }

        // Set up auth state listener for future changes
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
