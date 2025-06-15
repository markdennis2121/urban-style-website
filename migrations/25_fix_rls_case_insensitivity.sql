
-- This migration fixes the Row Level Security (RLS) policies for `profiles`
-- and `user_sessions` tables to be case-insensitive when checking for admin roles.
-- This ensures that users with roles like 'Admin' or 'SUPER_ADMIN' are correctly
-- granted administrative privileges.

-- == Fix for `profiles` table ==

-- Step 1: Drop the old, case-sensitive SELECT policy on the `profiles` table.
-- We also drop other potential old policies to ensure a clean state.
DROP POLICY IF EXISTS "Allow admin and individual user select" ON public.profiles;
DROP POLICY IF EXISTS "Allow admin and individual user select (case-insensitive)" ON public.profiles; -- Drop new one if it exists from a failed run
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Step 2: Create a new, case-insensitive SELECT policy.
-- This policy allows:
--  - Any authenticated user to view their own profile.
--  - Users with 'admin' or 'super_admin' roles (case-insensitive) to view ALL profiles.
CREATE POLICY "Allow admin and individual user select (case-insensitive)" ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    (auth.uid() = id) OR
    (EXISTS (
      SELECT 1
      FROM profiles p_check
      WHERE p_check.id = auth.uid() AND lower(p_check.role::text) IN ('admin', 'super_admin')
    ))
  );

-- == Fix for `user_sessions` table ==

-- Step 1: Drop the old, case-sensitive SELECT policy on the `user_sessions` table.
DROP POLICY IF EXISTS "Allow admin and individual user select" ON public.user_sessions;
DROP POLICY IF EXISTS "Allow admin and individual user select (case-insensitive)" ON public.user_sessions; -- Drop new one if it exists

-- Step 2: Create a new, case-insensitive SELECT policy.
-- This policy allows:
--  - Users to view their own sessions.
--  - Admins/superadmins (case-insensitive) to view ALL user sessions.
CREATE POLICY "Allow admin and individual user select (case-insensitive)" ON public.user_sessions
  FOR SELECT
  TO authenticated
  USING (
    (auth.uid() = user_id) OR
    (EXISTS (
      SELECT 1
      FROM profiles
      WHERE profiles.id = auth.uid() AND lower(profiles.role::text) IN ('admin', 'super_admin')
    ))
  );

-- Step 3: Re-assert permissions and enable RLS to apply changes.
-- This is good practice after modifying policies.
GRANT SELECT ON public.profiles TO authenticated;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.user_sessions TO authenticated;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
