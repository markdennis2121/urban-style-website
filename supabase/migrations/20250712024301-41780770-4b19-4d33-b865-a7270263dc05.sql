-- Remove super_admin role completely and standardize to only user, admin, superadmin

-- First, convert any existing super_admin users to superadmin (if any exist)
UPDATE public.profiles 
SET role = 'superadmin'::user_role 
WHERE role = 'super_admin'::user_role;

-- Update the user_role enum to remove super_admin
-- We need to recreate the enum with only the 3 roles
-- First, create a new enum
DO $$ 
BEGIN
    -- Drop the old enum if it exists and create a new one
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_new') THEN
        DROP TYPE user_role_new CASCADE;
    END IF;
    
    CREATE TYPE user_role_new AS ENUM ('user', 'admin', 'superadmin');
END $$;

-- Update the profiles table to use the new enum
ALTER TABLE public.profiles 
ALTER COLUMN role TYPE user_role_new USING role::text::user_role_new;

-- Drop the old enum and rename the new one
DROP TYPE user_role CASCADE;
ALTER TYPE user_role_new RENAME TO user_role;

-- Recreate the default constraint
ALTER TABLE public.profiles 
ALTER COLUMN role SET DEFAULT 'user'::user_role;

-- Update the check_user_role_v2 function to only handle 3 roles
CREATE OR REPLACE FUNCTION public.check_user_role_v2(required_role text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM profiles
        WHERE id = auth.uid()
        AND CASE 
            WHEN required_role = 'superadmin' THEN role = 'superadmin'
            WHEN required_role = 'admin' THEN role IN ('admin', 'superadmin')
            WHEN required_role = 'user' THEN role IN ('user', 'admin', 'superadmin')
            ELSE false
        END
    );
END;
$function$;

-- Update the overloaded check_user_role function
CREATE OR REPLACE FUNCTION public.check_user_role(required_role user_role)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM profiles
        WHERE id = auth.uid()
        AND CASE required_role
            WHEN 'superadmin' THEN role = 'superadmin'
            WHEN 'admin' THEN role IN ('admin', 'superadmin')
            WHEN 'user' THEN role IN ('user', 'admin', 'superadmin')
        END
    );
END;
$function$;

-- Create admin role checking functions
CREATE OR REPLACE FUNCTION public.check_admin_role(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = user_id 
        AND role IN ('admin', 'superadmin')
    );
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_super_admin_role(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = user_id 
        AND role = 'superadmin'
    );
END;
$function$;

-- Verify the final state
SELECT 'Role distribution after cleanup:' as info;
SELECT role, COUNT(*) as count FROM profiles GROUP BY role ORDER BY role;