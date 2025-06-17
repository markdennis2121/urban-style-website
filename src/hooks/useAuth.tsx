
import { useState, useEffect, useRef, useCallback } from 'react';
import { getCurrentProfile, Profile } from '@/lib/supabase/client';
import { supabase } from '@/lib/supabase/client';

export const useAuth = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const initRef = useRef(false);
  const subscriptionRef = useRef<any>(null);
  const mountedRef = useRef(true);

  const updateProfile = useCallback(async (userId?: string) => {
    if (!mountedRef.current) return;
    
    try {
      console.log('Updating profile for user:', userId);
      setError(null);
      const userProfile = await getCurrentProfile();
      console.log('Profile updated:', userProfile);
      
      if (mountedRef.current) {
        setProfile(userProfile);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      if (mountedRef.current) {
        setProfile(null);
        setLoading(false);
        // Don't set error for profile fetch failures during normal operation
        if (error instanceof Error && !error.message.includes('infinite recursion')) {
          setError(error.message);
        }
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    const initializeAuth = async () => {
      if (initRef.current) return;
      
      initRef.current = true;
      console.log('Initializing auth...');

      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          if (mountedRef.current) {
            setProfile(null);
            setLoading(false);
            setInitialized(true);
            setError('Session error: ' + sessionError.message);
          }
          return;
        }

        if (session?.user) {
          console.log('Found existing session for user:', session.user.email);
          await updateProfile(session.user.id);
        } else {
          console.log('No existing session');
          if (mountedRef.current) {
            setProfile(null);
            setLoading(false);
            setError(null);
          }
        }

        if (mountedRef.current) {
          setInitialized(true);
        }

        if (!subscriptionRef.current && mountedRef.current) {
          console.log('Setting up auth state listener');
          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
            console.log('Auth state changed:', event, newSession?.user?.email);
            
            if (!mountedRef.current) return;

            if (event === 'SIGNED_IN' && newSession?.user) {
              console.log('User signed in:', newSession.user.email);
              setLoading(true);
              setError(null);
              await updateProfile(newSession.user.id);
            } else if (event === 'SIGNED_OUT') {
              console.log('User signed out');
              if (mountedRef.current) {
                setProfile(null);
                setLoading(false);
                setError(null);
              }
            } else if (event === 'TOKEN_REFRESHED' && newSession?.user) {
              console.log('Token refreshed for user:', newSession.user.email);
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
          // Only show error for critical initialization failures
          if (error instanceof Error && !error.message.includes('infinite recursion')) {
            setError(error.message);
          }
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
  }, [updateProfile]);

  return {
    profile,
    loading,
    initialized,
    error,
    isAuthenticated: !!profile,
    isSuperAdmin: profile?.role === 'super_admin',
    isAdmin: profile?.role === 'admin' || profile?.role === 'super_admin',
  };
};
