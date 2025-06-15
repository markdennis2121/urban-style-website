
-- Fix RLS policies to ensure admins can see ALL user sessions, including regular users

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Admin can view all sessions" ON user_sessions;
DROP POLICY IF EXISTS "Admins can view all sessions" ON user_sessions;
DROP POLICY IF EXISTS "Users can insert own sessions" ON user_sessions;
DROP POLICY IF EXISTS "Users can update own sessions" ON user_sessions;
DROP POLICY IF EXISTS "Users can delete own sessions" ON user_sessions;
DROP POLICY IF EXISTS "Users can view own sessions" ON user_sessions;
DROP POLICY IF EXISTS "Users can manage their own sessions" ON user_sessions;
DROP POLICY IF EXISTS "Admin can manage all sessions" ON user_sessions;
DROP POLICY IF EXISTS "Users can insert their own sessions" ON user_sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON user_sessions;
DROP POLICY IF EXISTS "Users can delete their own sessions" ON user_sessions;

-- Create comprehensive policies that work for ALL users

-- 1. Allow ANY authenticated user to insert their own session
CREATE POLICY "authenticated_users_can_insert_sessions" ON user_sessions
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 2. Allow ANY authenticated user to update their own session  
CREATE POLICY "authenticated_users_can_update_sessions" ON user_sessions
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id);

-- 3. Allow ANY authenticated user to delete their own session
CREATE POLICY "authenticated_users_can_delete_sessions" ON user_sessions
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = user_id);

-- 4. Allow users to view their own sessions
CREATE POLICY "users_can_view_own_sessions" ON user_sessions
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

-- 5. Allow admins and super_admins to view ALL sessions (including regular users)
CREATE POLICY "admins_can_view_all_sessions" ON user_sessions
  FOR SELECT 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Grant necessary permissions explicitly
GRANT SELECT, INSERT, UPDATE, DELETE ON user_sessions TO authenticated;

-- Make sure the cleanup function works
CREATE OR REPLACE FUNCTION cleanup_old_sessions()
RETURNS void 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM user_sessions 
  WHERE last_activity < (NOW() - INTERVAL '2 hours');
END;
$$;

GRANT EXECUTE ON FUNCTION cleanup_old_sessions() TO authenticated;

-- Test that the policies work by checking if admins can see all sessions
-- This comment is just for documentation - the policies above should allow
-- admin/super_admin roles to SELECT from user_sessions for ANY user_id,
-- while regular users can only see their own sessions.
