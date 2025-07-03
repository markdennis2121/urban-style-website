
-- First, let's check the current role of the user
SELECT id, email, role, created_at, updated_at 
FROM public.profiles 
WHERE email = 'nibirumanangan@gmail.com';

-- Update the role to superadmin (using the correct enum value)
UPDATE public.profiles 
SET role = 'superadmin', updated_at = now()
WHERE email = 'nibirumanangan@gmail.com';

-- Verify the update worked
SELECT id, email, role, created_at, updated_at 
FROM public.profiles 
WHERE email = 'nibirumanangan@gmail.com';

-- Let's also check what enum values are available for user_role
SELECT unnest(enum_range(NULL::user_role)) as available_roles;
