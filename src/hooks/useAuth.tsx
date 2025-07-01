
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

      // Direct query to profiles table to get the most accurate role data
      console.log('Fetching profile directly from database for user:', targetUserId);
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetUserId)
        .single();

      if (profileError) {
        console.error('Direct profile query failed:', profileError);
        
        // Try alternative query by email if direct ID query fails
        if (user?.email) {
          console.log('Attempting fallback query by email:', user.email);
          const { data: emailProfile, error: emailError } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', user.email)
            .single();
          
          if (!emailError && emailProfile) {
            console.log('Profile found via email query:', emailProfile);
            if (mountedRef.current) {
              setProfile(emailProfile);
              setLoading(false);
            }
            return;
          }
        }
        
        // If all queries fail, create a basic profile structure
        console.log('Creating fallback profile structure');
        const fallbackProfile = {
          id: targetUserId,
          email: user?.email || '',
          username: user?.email?.split('@')[0] || 'user',
          role: 'user' as const,
          full_name: user?.user_metadata?.full_name || null,
          avatar_url: user?.user_metadata?.avatar_url || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        if (mountedRef.current) {
          setProfile(fallbackProfile);
          setLoading(false);
        }
        return;
      }

      console.log('Profile successfully retrieved:', profileData);
      console.log('User role detected as:', profileData.role);
      
      if (mountedRef.current) {
        setProfile(profileData);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error in updateProfile:', error);
      if (mountedRef.current) {
        setProfile(null);
        setLoading(false);
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
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          if (mountedRef.current) {
            setProfile(null);
            setLoading(false);
            setInitialized(true);
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

  // Enhanced role checking with proper handling of all role variations
  const isSuperAdmin = profile?.role === 'super_admin' || profile?.role === 'superadmin';
  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin' || profile?.role === 'superadmin';

  console.log('Current auth state:', {
    profile: profile,
    role: profile?.role,
    isSuperAdmin,
    isAdmin,
    loading,
    initialized
  });

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
