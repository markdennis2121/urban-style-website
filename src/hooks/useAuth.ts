
import { useState, useEffect, useRef } from 'react';
import { getCurrentProfile, Profile } from '@/lib/supabase/client';
import { supabase } from '@/lib/supabase/client';

export const useAuth = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  
  // Use refs to prevent multiple initializations
  const initRef = useRef(false);
  const subscriptionRef = useRef<any>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    // Reset mounted ref on mount
    mountedRef.current = true;

    const initializeAuth = async () => {
      // Prevent multiple initializations with stronger check
      if (initRef.current) {
        console.log('Auth already initialized, skipping');
        return;
      }
      
      initRef.current = true;
      console.log('Initializing auth...');

      try {
        // Get current session immediately
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          if (mountedRef.current) {
            setProfile(null);
            setLoading(false);
            setInitialized(true);
          }
          return;
        }

        if (session?.user) {
          console.log('Found existing session');
          
          // Load profile
          try {
            const userProfile = await getCurrentProfile();
            if (mountedRef.current) {
              console.log('Profile loaded:', userProfile);
              setProfile(userProfile);
              setLoading(false);
              setInitialized(true);
            }
          } catch (error) {
            console.error('Error loading profile:', error);
            if (mountedRef.current) {
              setProfile(null);
              setLoading(false);
              setInitialized(true);
            }
          }
        } else {
          console.log('No existing session');
          if (mountedRef.current) {
            setProfile(null);
            setLoading(false);
            setInitialized(true);
          }
        }

        // Set up auth state listener only once
        if (!subscriptionRef.current && mountedRef.current) {
          console.log('Setting up auth state listener');
          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
            console.log('Auth state changed:', event, !!newSession);
            
            if (!mountedRef.current) return;

            if (event === 'SIGNED_IN' && newSession?.user) {
              setLoading(true);
              try {
                const userProfile = await getCurrentProfile();
                if (mountedRef.current) {
                  setProfile(userProfile);
                  setLoading(false);
                }
              } catch (error) {
                console.error('Error getting profile after sign in:', error);
                if (mountedRef.current) {
                  setProfile(null);
                  setLoading(false);
                }
              }
            } else if (event === 'SIGNED_OUT') {
              console.log('User signed out');
              if (mountedRef.current) {
                setProfile(null);
                setLoading(false);
              }
            } else if (event === 'TOKEN_REFRESHED' && newSession?.user) {
              // Don't change loading state on token refresh
              try {
                const userProfile = await getCurrentProfile();
                if (mountedRef.current && userProfile) {
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
        if (mountedRef.current) {
          setProfile(null);
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    initializeAuth();

    return () => {
      console.log('Auth hook cleanup');
      mountedRef.current = false;
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
      // Reset init ref for potential remount
      initRef.current = false;
    };
  }, []); // Empty dependency array to run only once

  return {
    profile,
    loading,
    initialized,
    isAuthenticated: !!profile,
    isSuperAdmin: profile?.role === 'super_admin',
    isAdmin: profile?.role === 'admin' || profile?.role === 'super_admin'
  };
};
