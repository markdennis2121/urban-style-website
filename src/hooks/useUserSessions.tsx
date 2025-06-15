
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
    if (!isAuthenticated || !profile) return;

    const sessionId = getSessionId();
    
    try {
      await supabase
        .from('user_sessions')
        .upsert({
          user_id: profile.id,
          session_id: sessionId,
          last_activity: new Date().toISOString(),
        }, {
          onConflict: 'user_id,session_id'
        });
    } catch (error) {
      console.error('Error updating session:', error instanceof Error ? error.message : 'Unknown error');
    }
  }, [isAuthenticated, profile, getSessionId]);

  // Remove user's session on logout
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
      console.error('Error removing session:', error instanceof Error ? error.message : 'Unknown error');
    }
  }, [profile, getSessionId]);

  // Load all active sessions (admin only)
  const loadActiveSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if user_sessions table exists and has proper schema
      const { data: tableCheck, error: tableError } = await supabase
        .from('user_sessions')
        .select('id')
        .limit(1);

      if (tableError) {
        if (tableError.code === '42P01' || tableError.code === '42703') {
          // Table doesn't exist or schema issue
          setError('User sessions table not properly configured');
          setActiveSessions([]);
          return;
        }
        throw tableError;
      }

      // Clean up old sessions first
      try {
        await supabase.rpc('cleanup_old_sessions');
      } catch (cleanupError) {
        // Cleanup function might not exist, continue without it
      }
      
      // Get active sessions with user profiles
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('user_sessions')
        .select(`
          id,
          user_id,
          session_id,
          last_activity,
          created_at
        `)
        .gte('last_activity', thirtyMinutesAgo)
        .order('last_activity', { ascending: false });

      if (error) {
        throw error;
      }

      // Get user profiles for the sessions
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(session => session.user_id))];
        
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, email, role')
          .in('id', userIds);

        if (profilesError) {
          console.error('Error loading profiles:', profilesError.message);
          setActiveSessions(data);
          return;
        }

        // Enrich sessions with profile data
        const enrichedSessions = data.map(session => ({
          ...session,
          profiles: profilesData?.find(p => p.id === session.user_id) || null
        }));

        setActiveSessions(enrichedSessions);
      } else {
        setActiveSessions([]);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error loading active sessions:', errorMessage);
      setError(`Failed to load user sessions: ${errorMessage}`);
      setActiveSessions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update session on component mount and periodically
  useEffect(() => {
    if (isAuthenticated) {
      updateSession();
      
      // Update session every 5 minutes
      const interval = setInterval(updateSession, 5 * 60 * 1000);
      
      // Update session before page unload
      const handleBeforeUnload = () => {
        updateSession();
      };
      
      window.addEventListener('beforeunload', handleBeforeUnload);
      
      return () => {
        clearInterval(interval);
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    } else {
      removeSession();
    }
  }, [isAuthenticated, updateSession, removeSession]);

  return {
    activeSessions,
    loading,
    error,
    loadActiveSessions,
    updateSession,
    removeSession,
  };
};
