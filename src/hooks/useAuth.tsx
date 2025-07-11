
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

      // Direct query to profiles table with proper error handling
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
    if (initRef.current) return;
    initRef.current = true;
    mountedRef.current = true;

    const initAuth = async () => {
      try {
        console.log('Initializing auth...');
        
        // Set up auth state listener first
        subscriptionRef.current = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('Auth state changed:', event, session?.user?.email);
            
            if (session?.user) {
              // Use setTimeout to avoid potential recursion
              setTimeout(() => {
                updateProfile(session.user.id);
              }, 0);
            } else {
              if (mountedRef.current) {
                setProfile(null);
                setLoading(false);
                setInitialized(true);
              }
            }
          }
        );

        // Then check for existing session
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
          if (mountedRef.current) {
            setLoading(false);
            setInitialized(true);
          }
          return;
        }

        if (session?.user) {
          await updateProfile(session.user.id);
        } else {
          if (mountedRef.current) {
            setProfile(null);
            setLoading(false);
          }
        }
        
        if (mountedRef.current) {
          setInitialized(true);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mountedRef.current) {
          setProfile(null);
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    initAuth();

    return () => {
      mountedRef.current = false;
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [updateProfile]);

  const isAuthenticated = !!profile;
  const isAdmin = profile?.role === 'admin' || profile?.role === 'superadmin';
  const isSuperAdmin = profile?.role === 'superadmin';

  return {
    profile,
    loading,
    initialized,
    error,
    isAuthenticated,
    isAdmin,
    isSuperAdmin,
    updateProfile,
  };
};
