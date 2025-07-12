-- Remove super_admin role completely and standardize to only user, admin, superadmin
-- Safer approach using ALTER TYPE

-- First, convert any existing super_admin users to superadmin (if any exist)
UPDATE public.profiles 
SET role = 'superadmin'::user_role 
WHERE role = 'super_admin'::user_role;

-- Remove super_admin from the enum (if it exists)
-- Check if super_admin exists and remove it
DO $$ 
BEGIN
    -- Check if super_admin value exists in the enum
    IF EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'super_admin' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
    ) THEN
        -- Use a transaction-safe approach to remove the enum value
        -- Create a new enum without super_admin
        CREATE TYPE user_role_temp AS ENUM ('user', 'admin', 'superadmin');
        
        -- Update the column to use the new type
        ALTER TABLE public.profiles ALTER COLUMN role TYPE user_role_temp USING role::text::user_role_temp;
        
        -- Drop the old type and rename the new one
        DROP TYPE user_role;
        ALTER TYPE user_role_temp RENAME TO user_role;
        
        -- Set the default back
        ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'user'::user_role;
    END IF;
END $$;

-- Update all role checking functions to only handle 3 roles
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

-- Verify the final state - show all users and their roles
SELECT 'Users by role after cleanup:' as info;
SELECT 
    p.email,
    p.role,
    p.created_at
FROM profiles p 
ORDER BY p.role, p.email;