
import { useState, useEffect, useRef, useCallback } from 'react';
import { getCurrentProfile, Profile } from '@/lib/supabase/client';
import { supabase } from '@/lib/supabase/client';

export const useAuth = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  
  // Single initialization guard
  const initRef = useRef(false);
  const subscriptionRef = useRef<any>(null);
  const mountedRef = useRef(true);

  // Optimized profile update callback
  const updateProfile = useCallback(async (userId?: string) => {
    if (!mountedRef.current) return;
    
    try {
      const userProfile = await getCurrentProfile();
      if (mountedRef.current) {
        setProfile(userProfile);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      if (mountedRef.current) {
        setProfile(null);
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    const initializeAuth = async () => {
      // Prevent multiple initializations
      if (initRef.current) {
        return;
      }
      
      initRef.current = true;
      console.log('Initializing auth...');

      try {
        // Get current session
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
          await updateProfile(session.user.id);
        } else {
          console.log('No existing session');
          if (mountedRef.current) {
            setProfile(null);
            setLoading(false);
          }
        }

        if (mountedRef.current) {
          setInitialized(true);
        }

        // Set up auth state listener only once
        if (!subscriptionRef.current && mountedRef.current) {
          console.log('Setting up auth state listener');
          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
            // Skip INITIAL_SESSION events to reduce noise
            if (event === 'INITIAL_SESSION') {
              return;
            }
            
            console.log('Auth state changed:', event);
            
            if (!mountedRef.current) return;

            if (event === 'SIGNED_IN' && newSession?.user) {
              setLoading(true);
              await updateProfile(newSession.user.id);
            } else if (event === 'SIGNED_OUT') {
              console.log('User signed out');
              if (mountedRef.current) {
                setProfile(null);
                setLoading(false);
              }
            } else if (event === 'TOKEN_REFRESHED' && newSession?.user) {
              await updateProfile(newSession.user.id);
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
    };
  }, []); // Empty dependency array - only run once

  return {
    profile,
    loading,
    initialized,
    isAuthenticated: !!profile,
    isSuperAdmin: profile?.role?.toLowerCase() === 'super_admin',
    isAdmin: ['admin', 'super_admin'].includes(profile?.role?.toLowerCase() ?? ''),
  };
};
