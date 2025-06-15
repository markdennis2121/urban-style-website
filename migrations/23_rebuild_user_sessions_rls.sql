
-- This migration ensures user_sessions RLS policies are correctly set up
-- by removing all old policies and creating a clean, definitive set.

-- Step 1: Drop EVERY possible existing policy on the user_sessions table to prevent conflicts.
-- It's safe to run these even if the policies don't exist.
DROP POLICY IF EXISTS "Admin can view all sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Users can manage their own sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Users can insert their own sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Users can delete their own sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Users can view own sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Admins can view all sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Admin can manage all sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "authenticated_users_can_insert_sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "authenticated_users_can_update_sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "authenticated_users_can_delete_sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "users_can_view_sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Allow individual user insert" ON public.user_sessions;
DROP POLICY IF EXISTS "Allow individual user update" ON public.user_sessions;
DROP POLICY IF EXISTS "Allow individual user delete" ON public.user_sessions;
DROP POLICY IF EXISTS "Allow admin and individual user select" ON public.user_sessions;

-- Step 2: Create the definitive set of policies.

-- 2.1: Allow ANY authenticated user to create their own session record.
CREATE POLICY "Allow individual user insert" ON public.user_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 2.2: Allow ANY authenticated user to update their own session record.
CREATE POLICY "Allow individual user update" ON public.user_sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- 2.3: Allow ANY authenticated user to delete their own session record.
CREATE POLICY "Allow individual user delete" ON public.user_sessions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 2.4: Allow users to view their own session, and admins/superadmins to view ALL sessions.
CREATE POLICY "Allow admin and individual user select" ON public.user_sessions
  FOR SELECT
  TO authenticated
  USING (
    (auth.uid() = user_id) OR
    (EXISTS (
      SELECT 1
      FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')
    ))
  );

-- Step 3: Ensure Row Level Security is enabled for the table.
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Step 4: Ensure the 'authenticated' role has the necessary permissions on the table.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_sessions TO authenticated;
