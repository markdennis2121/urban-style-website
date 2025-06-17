
-- Standardize user roles in the database
-- This migration ensures consistent role naming across the application

BEGIN;

-- First, let's see what roles currently exist and update them
-- Update any 'superadmin' roles to 'super_admin' for consistency
UPDATE public.profiles 
SET role = 'super_admin' 
WHERE role = 'superadmin';

-- Ensure the enum type includes all necessary values
-- Drop and recreate the enum if needed
DO $$ 
BEGIN
    -- Check if we need to alter the enum
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'super_admin' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
    ) THEN
        ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'super_admin';
    END IF;
END $$;

-- Create a function to check user roles that handles both naming conventions
CREATE OR REPLACE FUNCTION public.check_admin_role(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role 
    FROM public.profiles 
    WHERE id = user_id;
    
    RETURN user_role IN ('admin', 'super_admin', 'superadmin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.check_super_admin_role(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role 
    FROM public.profiles 
    WHERE id = user_id;
    
    RETURN user_role IN ('super_admin', 'superadmin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.check_admin_role(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.check_super_admin_role(UUID) TO authenticated, anon;

-- Update the profiles table to ensure we have test accounts
-- Insert or update super admin account
INSERT INTO public.profiles (id, email, username, role, full_name)
VALUES (
    '00000000-0000-0000-0000-000000000001'::UUID,
    'superadmin@urbanstyle.com',
    'superadmin',
    'super_admin',
    'Super Administrator'
)
ON CONFLICT (id) DO UPDATE SET
    role = 'super_admin',
    email = 'superadmin@urbanstyle.com',
    full_name = 'Super Administrator';

-- Insert or update admin account
INSERT INTO public.profiles (id, email, username, role, full_name)
VALUES (
    '00000000-0000-0000-0000-000000000002'::UUID,
    'admin@urbanstyle.com',
    'admin',
    'admin',
    'Administrator'
)
ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    email = 'admin@urbanstyle.com',
    full_name = 'Administrator';

-- Also ensure corresponding auth.users entries exist
-- Note: In a real scenario, you'd need to create these through Supabase Auth
-- This is just to ensure the profiles are properly linked

-- Create a debug view to check user roles
CREATE OR REPLACE VIEW public.user_roles_debug AS
SELECT 
    p.id,
    p.email,
    p.username,
    p.role,
    p.full_name,
    p.created_at,
    CASE 
        WHEN p.role IN ('admin', 'super_admin', 'superadmin') THEN 'admin_access'
        ELSE 'user_access'
    END as access_level
FROM public.profiles p
ORDER BY p.created_at DESC;

-- Grant access to the debug view
GRANT SELECT ON public.user_roles_debug TO authenticated, anon;

COMMIT;
