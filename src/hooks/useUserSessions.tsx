
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

  // Generate session ID
  const getSessionId = useCallback(() => {
    let sessionId = sessionStorage.getItem('user_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('user_session_id', sessionId);
    }
    return sessionId;
  }, []);

  // Update session - works for ALL authenticated users
  const updateSession = useCallback(async () => {
    if (!isAuthenticated || !profile) {
      return;
    }

    const sessionId = getSessionId();
    
    try {
      console.log('Updating session for user:', profile.email, 'role:', profile.role);
      
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
        console.error('Session update error:', error);
      } else {
        console.log('Session updated successfully for:', profile.email);
      }
    } catch (error) {
      console.error('Error in updateSession:', error);
    }
  }, [isAuthenticated, profile, getSessionId]);

  // Remove session
  const removeSession = useCallback(async () => {
    if (!profile) return;

    const sessionId = getSessionId();
    
    try {
      await supabase
        .from('user_sessions')
        .delete()
        .eq('user_id', profile.id)
        .eq('session_id', sessionId);
      
      sessionStorage.removeItem('user_session_id');
    } catch (error) {
      console.error('Error removing session:', error);
    }
  }, [profile, getSessionId]);

  // Load active sessions (admin only)
  const loadActiveSessions = useCallback(async () => {
    if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
      setActiveSessions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Get sessions active in the last 2 hours
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
      
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
        .gte('last_activity', twoHoursAgo)
        .order('last_activity', { ascending: false });

      if (sessionsError) {
        throw new Error(sessionsError.message);
      }

      console.log('Active sessions loaded:', sessionsData?.length || 0);

      if (!sessionsData) {
        setActiveSessions([]);
        return;
      }

      // Transform the data
      const transformedSessions = sessionsData.map(session => ({
        ...session,
        profiles: Array.isArray(session.profiles) ? session.profiles[0] : session.profiles
      }));

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

  // Set up session tracking
  useEffect(() => {
    if (isAuthenticated && profile) {
      console.log('Starting session tracking for:', profile.email);
      
      // Update session immediately
      updateSession();
      
      // Update every 30 seconds for better real-time tracking
      const interval = setInterval(updateSession, 30 * 1000);
      
      // Update on page focus/visibility
      const handleVisibilityChange = () => {
        if (!document.hidden) {
          updateSession();
        }
      };
      
      const handleBeforeUnload = () => {
        updateSession();
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('beforeunload', handleBeforeUnload);
      
      return () => {
        clearInterval(interval);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    } else if (!isAuthenticated) {
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
