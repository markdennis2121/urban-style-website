
-- Fix infinite recursion in profiles RLS policies
-- This migration addresses the circular dependency in RLS policies

BEGIN;

-- Drop all existing problematic RLS policies on profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile except role" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow admin and individual user select" ON public.profiles;

-- Create simple, non-recursive RLS policies
-- Policy 1: Users can always see their own profile (no role check needed)
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT TO authenticated
    USING (auth.uid() = id);

-- Policy 2: Users can update their own profile (but not role field)
CREATE POLICY "Users can update own profile basic" ON public.profiles
    FOR UPDATE TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id AND
        (NEW.role = OLD.role) -- Role cannot be changed by regular users
    );

-- Policy 3: Allow insert for new user creation (during signup)
CREATE POLICY "Allow profile creation" ON public.profiles
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = id);

-- Policy 4: Create a security definer function for admin operations
CREATE OR REPLACE FUNCTION public.is_admin_or_super_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Direct query without RLS to avoid recursion
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = user_id 
        AND role IN ('admin', 'super_admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policy 5: Admins can view all profiles (using security definer function)
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT TO authenticated
    USING (public.is_admin_or_super_admin(auth.uid()));

-- Policy 6: Super admins can update any profile
CREATE POLICY "Super admins can manage all profiles" ON public.profiles
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
            AND p.role = 'super_admin'
        )
    );

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.is_admin_or_super_admin(UUID) TO authenticated;

COMMIT;
