
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
      
      // Get current user if no userId provided
      const { data: { user } } = await supabase.auth.getUser();
      const targetUserId = userId || user?.id;
      
      if (!targetUserId) {
        console.log('No user ID available');
        if (mountedRef.current) {
          setProfile(null);
          setLoading(false);
        }
        return;
      }

      // Try to get profile with fallback handling
      let userProfile = null;
      try {
        userProfile = await getCurrentProfile();
        console.log('Profile retrieved:', userProfile);
      } catch (profileError) {
        console.error('Profile fetch error:', profileError);
        
        // If RLS is blocking, try a direct approach
        if (user?.email) {
          console.log('Attempting profile creation/recovery for:', user.email);
          try {
            const { data: createdProfile, error: createError } = await supabase
              .from('profiles')
              .upsert([
                {
                  id: user.id,
                  email: user.email,
                  username: user.email.split('@')[0],
                  role: 'user'
                }
              ], { onConflict: 'id' })
              .select('*')
              .single();

            if (!createError && createdProfile) {
              userProfile = createdProfile;
              console.log('Profile created/updated:', userProfile);
            }
          } catch (upsertError) {
            console.error('Profile upsert failed:', upsertError);
          }
        }
      }
      
      if (mountedRef.current) {
        setProfile(userProfile);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error in updateProfile:', error);
      if (mountedRef.current) {
        setProfile(null);
        setLoading(false);
        // Only set error for critical failures
        if (error instanceof Error && error.message.includes('network')) {
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
        // Get session with error handling
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          if (mountedRef.current) {
            setProfile(null);
            setLoading(false);
            setInitialized(true);
            // Only show critical session errors
            if (!sessionError.message.includes('refresh')) {
              setError('Authentication service unavailable');
            }
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

        // Set up auth listener with error handling
        if (!subscriptionRef.current && mountedRef.current) {
          console.log('Setting up auth state listener');
          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
            console.log('Auth state changed:', event, newSession?.user?.email);
            
            if (!mountedRef.current) return;

            try {
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
            } catch (authError) {
              console.error('Auth state change error:', authError);
              // Don't propagate auth state errors to UI
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
          // Only show critical initialization errors
          if (error instanceof Error && error.message.includes('network')) {
            setError('Unable to connect to authentication service');
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

  // Enhanced role checking functions with proper type handling
  const isSuperAdmin = profile?.role === 'super_admin';
  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';

  return {
    profile,
    loading,
    initialized,
    error,
    isAuthenticated: !!profile,
    isSuperAdmin,
    isAdmin,
  };
};
