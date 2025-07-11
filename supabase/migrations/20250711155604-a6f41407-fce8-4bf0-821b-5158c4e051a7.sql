-- Phase 1: Fix Role Inconsistency - Standardize to 'superadmin'

-- Update the user_role enum to use 'superadmin' instead of 'super_admin'
-- First, update any existing super_admin roles to superadmin
UPDATE profiles SET role = 'superadmin' WHERE role = 'super_admin';

-- Update the enum definition (this will be handled by Supabase automatically)
-- The enum already includes both 'super_admin' and 'superadmin' so we're good

-- Create a function to check roles consistently 
CREATE OR REPLACE FUNCTION public.check_user_role_v2(required_role text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM profiles
        WHERE id = auth.uid()
        AND CASE 
            WHEN required_role = 'superadmin' THEN role IN ('superadmin', 'super_admin')
            WHEN required_role = 'admin' THEN role IN ('admin', 'superadmin', 'super_admin')
            WHEN required_role = 'user' THEN role IN ('user', 'admin', 'superadmin', 'super_admin')
            ELSE false
        END
    );
END;
$$;