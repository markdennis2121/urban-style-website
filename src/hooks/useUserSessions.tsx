
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
    id: string;
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
      console.log('Updating session for user:', profile.email, 'role:', profile.role, 'user_id:', profile.id);
      
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
      console.log('Not admin, skipping session load. Profile:', profile);
      setActiveSessions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Get sessions active in the last hour (more recent)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      
      console.log('Loading sessions since:', oneHourAgo);
      
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
        console.error('Sessions query error:', sessionsError);
        throw new Error(sessionsError.message);
      }

      console.log('Raw sessions data from DB:', sessionsData);

      if (!sessionsData) {
        setActiveSessions([]);
        return;
      }

      // Transform the data to handle both array and object profiles
      const transformedSessions = sessionsData.map(session => {
        console.log('Processing session:', session);
        return {
          ...session,
          profiles: Array.isArray(session.profiles) ? session.profiles[0] : session.profiles
        };
      });

      console.log('Transformed sessions:', transformedSessions);
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
      
      // Update every 30 seconds
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
