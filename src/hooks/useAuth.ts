
import { useState, useEffect, useRef } from 'react';
import { getCurrentProfile, Profile } from '@/lib/supabase/client';
import { supabase } from '@/lib/supabase/client';

export const useAuth = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const initRef = useRef(false);
  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      // Prevent multiple initializations
      if (initRef.current) return;
      initRef.current = true;

      try {
        console.log('Initializing auth...');
        
        // First check if we have a session immediately
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

        // If we have a session, immediately set as initialized to prevent flash
        if (session?.user && mounted) {
          console.log('Found existing session, setting initialized');
          setInitialized(true);
          setLoading(false);
          
          // Load profile in background
          try {
            const userProfile = await getCurrentProfile();
            if (mounted && userProfile) {
              console.log('Profile loaded:', userProfile);
              setProfile(userProfile);
            }
          } catch (error) {
            console.error('Error loading profile:', error);
            if (mounted) {
              setProfile(null);
            }
          }
        } else {
          console.log('No existing session');
          if (mounted) {
            setProfile(null);
            setLoading(false);
            setInitialized(true);
          }
        }

        // Set up auth state listener for future changes only
        if (!subscriptionRef.current) {
          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
            console.log('Auth state changed:', event, !!newSession);
            
            if (!mounted) return;

            if (event === 'SIGNED_IN' && newSession?.user) {
              setLoading(true);
              try {
                const userProfile = await getCurrentProfile();
                if (mounted) {
                  setProfile(userProfile);
                  setInitialized(true);
                  setLoading(false);
                }
              } catch (error) {
                console.error('Error getting profile after sign in:', error);
                if (mounted) {
                  setProfile(null);
                  setLoading(false);
                }
              }
            } else if (event === 'SIGNED_OUT') {
              console.log('User signed out');
              if (mounted) {
                setProfile(null);
                setLoading(false);
                setInitialized(true);
              }
            } else if (event === 'TOKEN_REFRESHED' && newSession?.user) {
              // Don't change loading state on token refresh, just update profile if needed
              try {
                const userProfile = await getCurrentProfile();
                if (mounted && userProfile) {
                  setProfile(userProfile);
                }
              } catch (error) {
                console.error('Error refreshing profile:', error);
              }
            }
          });

          subscriptionRef.current = subscription;
        }
        
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setProfile(null);
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    initializeAuth();

    // Cleanup function
    return () => {
      mounted = false;
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, []);

  return {
    profile,
    loading,
    initialized,
    isAuthenticated: !!profile,
    isSuperAdmin: profile?.role === 'super_admin',
    isAdmin: profile?.role === 'admin' || profile?.role === 'super_admin'
  };
};
