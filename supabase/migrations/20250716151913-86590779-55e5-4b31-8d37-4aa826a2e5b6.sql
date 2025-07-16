-- Fix security definer functions by dropping dependent policies first

-- Drop policies that depend on the functions
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;

-- Drop and recreate the functions
DROP FUNCTION IF EXISTS public.is_admin_user();
DROP FUNCTION IF EXISTS public.is_super_admin_user();

-- Create corrected security definer functions
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
    user_role text;
BEGIN
    -- Get the current user's role
    SELECT role INTO user_role
    FROM public.profiles 
    WHERE id = auth.uid();
    
    -- Return true if user is admin or superadmin
    RETURN user_role IN ('admin', 'superadmin');
END;
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin_user()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
    user_role text;
BEGIN
    -- Get the current user's role
    SELECT role INTO user_role
    FROM public.profiles 
    WHERE id = auth.uid();
    
    -- Return true if user is superadmin
    RETURN user_role = 'superadmin';
END;
$$;

-- Recreate the admin policies
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
TO authenticated
USING (public.is_admin_user());

CREATE POLICY "Admins can update any profile"
ON profiles FOR UPDATE
TO authenticated
USING (public.is_admin_user());

-- Final verification - show clean role system
SELECT 
    'Final verification: Clean role system' as status,
    email,
    role,
    CASE 
        WHEN role = 'superadmin' THEN 'Can access admin dashboard'
        WHEN role = 'admin' THEN 'Can access admin dashboard'
        ELSE 'Regular user'
    END as access_level
FROM profiles 
ORDER BY role, email;