
-- Fix user_sessions table schema - add missing session_id column
ALTER TABLE user_sessions 
ADD COLUMN IF NOT EXISTS session_id VARCHAR(255);

-- Update the unique constraint to include both user_id and session_id
ALTER TABLE user_sessions 
DROP CONSTRAINT IF EXISTS user_sessions_user_id_session_id_key;

ALTER TABLE user_sessions 
ADD CONSTRAINT user_sessions_user_id_session_id_key UNIQUE(user_id, session_id);

-- Ensure the table has proper structure
CREATE TABLE IF NOT EXISTS user_sessions_new (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_id VARCHAR(255) NOT NULL,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, session_id)
);

-- Copy data if the old table exists
INSERT INTO user_sessions_new (user_id, last_activity, created_at)
SELECT user_id, last_activity, created_at 
FROM user_sessions 
WHERE NOT EXISTS (SELECT 1 FROM user_sessions_new WHERE user_sessions_new.user_id = user_sessions.user_id);

-- Drop old table and rename new one
DROP TABLE IF EXISTS user_sessions;
ALTER TABLE user_sessions_new RENAME TO user_sessions;

-- Recreate indexes
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_last_activity ON user_sessions(last_activity);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON user_sessions(session_id);

-- Enable RLS
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Recreate RLS policies
DROP POLICY IF EXISTS "Admin can view all sessions" ON user_sessions;
DROP POLICY IF EXISTS "Users can manage their own sessions" ON user_sessions;

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

-- Update the cleanup function
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
