
-- Drop existing table to start fresh
DROP TABLE IF EXISTS user_sessions CASCADE;

-- Create user_sessions table with proper structure
CREATE TABLE user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_id VARCHAR(255) NOT NULL,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, session_id)
);

-- Create indexes for better performance
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_last_activity ON user_sessions(last_activity);
CREATE INDEX idx_user_sessions_session_id ON user_sessions(session_id);

-- Enable RLS
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admin can view all sessions" ON user_sessions;
DROP POLICY IF EXISTS "Users can manage their own sessions" ON user_sessions;
DROP POLICY IF EXISTS "Users can insert their own sessions" ON user_sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON user_sessions;
DROP POLICY IF EXISTS "Users can delete their own sessions" ON user_sessions;
DROP POLICY IF EXISTS "Admin can manage all sessions" ON user_sessions;

-- Create comprehensive RLS policies
CREATE POLICY "Admin can view all sessions" ON user_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Users can insert their own sessions" ON user_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" ON user_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions" ON user_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Admin can manage all sessions
CREATE POLICY "Admin can manage all sessions" ON user_sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Function to clean up old sessions
CREATE OR REPLACE FUNCTION cleanup_old_sessions()
RETURNS void 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM user_sessions 
  WHERE last_activity < (NOW() - INTERVAL '30 minutes');
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION cleanup_old_sessions() TO authenticated;
