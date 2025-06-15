
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from './useAuth';

interface UserSession {
  id: string;
  user_id: string;
  session_id: string;
  last_activity: string;
  created_at: string;
  profiles?: {
    full_name: string;
    email: string;
    role: string;
  };
}

export const useUserSessions = () => {
  const [activeSessions, setActiveSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile, isAuthenticated } = useAuth();

  // Generate a unique session ID for this browser session
  const getSessionId = useCallback(() => {
    let sessionId = sessionStorage.getItem('user_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('user_session_id', sessionId);
    }
    return sessionId;
  }, []);

  // Update user's session activity - works for ALL authenticated users
  const updateSession = useCallback(async () => {
    if (!isAuthenticated || !profile) {
      console.log('Not authenticated or no profile, skipping session update');
      return;
    }

    const sessionId = getSessionId();
    
    try {
      console.log('Updating session for user:', profile.id, 'role:', profile.role, 'session:', sessionId);
      
      // Use upsert to handle both insert and update
      const { error } = await supabase
        .from('user_sessions')
        .upsert({
          user_id: profile.id,
          session_id: sessionId,
          last_activity: new Date().toISOString(),
        }, {
          onConflict: 'user_id,session_id'
        });

      if (error) {
        console.error('Error updating session:', error);
        // Try alternative approach if upsert fails
        const { error: insertError } = await supabase
          .from('user_sessions')
          .insert({
            user_id: profile.id,
            session_id: sessionId,
            last_activity: new Date().toISOString(),
          });
        
        if (insertError && !insertError.message.includes('duplicate')) {
          console.error('Error inserting session:', insertError);
        }
      } else {
        console.log('Session updated successfully for user:', profile.role);
      }
    } catch (error) {
      console.error('Error in updateSession:', error instanceof Error ? error.message : 'Unknown error');
    }
  }, [isAuthenticated, profile, getSessionId]);

  // Remove user's session on logout
  const removeSession = useCallback(async () => {
    if (!profile) return;

    const sessionId = getSessionId();
    
    try {
      console.log('Removing session for user:', profile.id);
      await supabase
        .from('user_sessions')
        .delete()
        .eq('user_id', profile.id)
        .eq('session_id', sessionId);
      
      sessionStorage.removeItem('user_session_id');
      console.log('Session removed successfully');
    } catch (error) {
      console.error('Error removing session:', error instanceof Error ? error.message : 'Unknown error');
    }
  }, [profile, getSessionId]);

  // Load all active sessions (admin only) with better error handling
  const loadActiveSessions = useCallback(async () => {
    // Only load if user has admin privileges
    if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
      console.log('User does not have admin privileges:', profile?.role);
      setActiveSessions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('Loading active sessions for admin user:', profile.role);
      
      // Use longer window for active sessions (1 hour instead of 30 minutes)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      
      // Get active sessions with direct query
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('user_sessions')
        .select(`
          *,
          profiles:user_id (
            id,
            full_name,
            email,
            role
          )
        `)
        .gte('last_activity', oneHourAgo)
        .order('last_activity', { ascending: false });

      if (sessionsError) {
        console.error('Sessions fetch error:', sessionsError);
        throw new Error(`Failed to fetch sessions: ${sessionsError.message}`);
      }

      console.log('Sessions fetched successfully:', sessionsData?.length || 0);

      if (!sessionsData || sessionsData.length === 0) {
        console.log('No active sessions found');
        setActiveSessions([]);
        return;
      }

      // Transform the data to match our interface
      const transformedSessions = sessionsData.map(session => ({
        ...session,
        profiles: Array.isArray(session.profiles) ? session.profiles[0] : session.profiles
      }));

      console.log('Transformed sessions:', transformedSessions.map(s => ({
        user_id: s.user_id,
        role: s.profiles?.role,
        email: s.profiles?.email,
        last_activity: s.last_activity
      })));

      setActiveSessions(transformedSessions);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error loading active sessions:', errorMessage);
      setError(errorMessage);
      setActiveSessions([]);
    } finally {
      setLoading(false);
    }
  }, [profile]);

  // Update session on component mount and periodically for ALL users
  useEffect(() => {
    if (isAuthenticated && profile) {
      console.log('Setting up session tracking for user:', profile.email, 'role:', profile.role);
      
      // Update session immediately
      updateSession();
      
      // Update session every minute for better tracking
      const interval = setInterval(() => {
        console.log('Periodic session update for:', profile.role);
        updateSession();
      }, 60 * 1000);
      
      // Update session before page unload
      const handleBeforeUnload = () => {
        updateSession();
      };
      
      // Also update on visibility change
      const handleVisibilityChange = () => {
        if (!document.hidden) {
          updateSession();
        }
      };
      
      window.addEventListener('beforeunload', handleBeforeUnload);
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      return () => {
        clearInterval(interval);
        window.removeEventListener('beforeunload', handleBeforeUnload);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    } else if (!isAuthenticated) {
      console.log('User not authenticated, removing session');
      removeSession();
    }
  }, [isAuthenticated, profile, updateSession, removeSession]);

  return {
    activeSessions,
    loading,
    error,
    loadActiveSessions,
    updateSession,
    removeSession,
  };
};
