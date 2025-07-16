-- Fix the security definer functions to work properly with auth.uid()

-- Drop existing functions
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

-- Test the corrected functions
SELECT 
    'Testing corrected admin functions' as test,
    auth.uid() as current_user_id,
    p.email,
    p.role,
    public.is_admin_user() as can_access_admin,
    public.is_super_admin_user() as is_super_admin
FROM profiles p 
WHERE p.id = auth.uid();