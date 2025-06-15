
-- Fix RLS policies for user_sessions table to match role names

-- Drop existing policies
DROP POLICY IF EXISTS "Admin can view all sessions" ON user_sessions;
DROP POLICY IF EXISTS "Users can manage their own sessions" ON user_sessions;

-- Create updated RLS policies with correct role names
CREATE POLICY "Admin can view all sessions" ON user_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Users can manage their own sessions" ON user_sessions
  FOR ALL USING (auth.uid() = user_id);

-- Clean up old sessions (older than 1 hour instead of 30 minutes for better tracking)
CREATE OR REPLACE FUNCTION cleanup_old_sessions()
RETURNS void 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM user_sessions 
  WHERE last_activity < (NOW() - INTERVAL '1 hour');
END;
$$;
