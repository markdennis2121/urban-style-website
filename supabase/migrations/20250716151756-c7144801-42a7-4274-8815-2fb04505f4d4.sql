-- Fix infinite recursion in RLS policies for profiles table
-- This is the core issue preventing admin dashboard access

-- First, drop all existing RLS policies on profiles
DROP POLICY IF EXISTS "Users can view own profile or admins can view all" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;

-- Create a security definer function that bypasses RLS to check roles
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'superadmin')
    );
END;
$$;

-- Create a security definer function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin_user()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role = 'superadmin'
    );
END;
$$;

-- Create new RLS policies that avoid recursion
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
TO authenticated
USING (public.is_admin_user());

CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Admins can update any profile"
ON profiles FOR UPDATE
TO authenticated
USING (public.is_admin_user());

-- Test the functions work
SELECT 
    'Testing role functions - should return current user role info' as test,
    p.email,
    p.role,
    public.is_admin_user() as is_admin,
    public.is_super_admin_user() as is_super_admin
FROM profiles p 
WHERE id = auth.uid();

-- Show all users with their roles
SELECT 
    'All users with clean roles' as info,
    email,
    role,
    created_at
FROM profiles 
ORDER BY role, email;