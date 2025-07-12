-- Update role checking functions to only handle 3 roles: user, admin, superadmin
-- No need to change the enum since super_admin isn't being used

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

-- Show final user accounts with roles
SELECT 
    'Final user accounts:' as info,
    p.email,
    p.role,
    p.created_at
FROM profiles p 
ORDER BY p.role, p.email;