
-- This migration fixes an issue where admins could not see regular users'
-- profile data in queries, which prevented the "Online Users" list from
-- showing non-admin users.

-- Step 1: Drop all potential existing SELECT policies on the `profiles` table.
-- This ensures a clean slate and prevents conflicts.
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile." ON public.profiles;
DROP POLICY IF EXISTS "User can view their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Allow individual user select" ON public.profiles;
DROP POLICY IF EXISTS "Allow admin and individual user select" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;


-- Step 2: Create a single, definitive SELECT policy.
-- This policy allows:
--  - Any authenticated user to view their own profile.
--  - Users with 'admin' or 'super_admin' roles to view ALL profiles.
CREATE POLICY "Allow admin and individual user select" ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    (auth.uid() = id) OR
    (EXISTS (
      SELECT 1
      FROM profiles p_check
      WHERE p_check.id = auth.uid() AND p_check.role IN ('admin', 'super_admin')
    ))
  );

-- Step 3: Ensure the 'authenticated' role has SELECT permissions on the `profiles` table.
-- This is crucial for the policy to apply correctly.
GRANT SELECT ON public.profiles TO authenticated;

-- Step 4: Re-enable RLS on the table to apply the new policy.
-- It's good practice to toggle it to ensure changes are loaded.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
