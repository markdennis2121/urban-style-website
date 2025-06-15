
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

  // Update user's session activity
  const updateSession = useCallback(async () => {
    if (!isAuthenticated || !profile) {
      console.log('Not authenticated or no profile, skipping session update');
      return;
    }

    const sessionId = getSessionId();
    
    try {
      console.log('Updating session for user:', profile.id, 'with session:', sessionId);
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
      } else {
        console.log('Session updated successfully');
      }
    } catch (error) {
      console.error('Error updating session:', error instanceof Error ? error.message : 'Unknown error');
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

  // Load all active sessions (admin only)
  const loadActiveSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Loading active sessions...');
      
      // Clean up old sessions first (older than 30 minutes)
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
      
      await supabase
        .from('user_sessions')
        .delete()
        .lt('last_activity', thirtyMinutesAgo);

      // Get active sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('user_sessions')
        .select('*')
        .gte('last_activity', thirtyMinutesAgo)
        .order('last_activity', { ascending: false });

      if (sessionsError) {
        console.error('Sessions fetch error:', sessionsError);
        throw new Error(`Failed to fetch sessions: ${sessionsError.message}`);
      }

      console.log('Sessions fetched:', sessionsData?.length || 0);

      if (!sessionsData || sessionsData.length === 0) {
        setActiveSessions([]);
        return;
      }

      // Get user profiles for the sessions
      const userIds = [...new Set(sessionsData.map(session => session.user_id))];
      console.log('Fetching profiles for users:', userIds.length);
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email, role')
        .in('id', userIds);

      if (profilesError) {
        console.error('Profiles fetch error:', profilesError);
        // Continue without profiles rather than failing completely
        setActiveSessions(sessionsData);
        return;
      }

      console.log('Profiles fetched:', profilesData?.length || 0);

      // Enrich sessions with profile data
      const enrichedSessions = sessionsData.map(session => ({
        ...session,
        profiles: profilesData?.find(p => p.id === session.user_id) || null
      }));

      setActiveSessions(enrichedSessions);
      console.log('Active sessions loaded successfully:', enrichedSessions.length);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error loading active sessions:', errorMessage);
      setError(errorMessage);
      setActiveSessions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update session on component mount and periodically
  useEffect(() => {
    if (isAuthenticated && profile) {
      console.log('Setting up session tracking for authenticated user:', profile.id);
      
      // Update session immediately
      updateSession();
      
      // Update session every 2 minutes instead of 5
      const interval = setInterval(updateSession, 2 * 60 * 1000);
      
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
