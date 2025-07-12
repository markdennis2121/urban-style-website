-- Remove super_admin role completely and standardize to only user, admin, superadmin
-- Handle RLS policies that depend on the role column

-- First, convert any existing super_admin users to superadmin (if any exist)
UPDATE public.profiles 
SET role = 'superadmin'::user_role 
WHERE role = 'super_admin'::user_role;

-- Drop all RLS policies that reference the role column
DROP POLICY IF EXISTS "Users can view own cart items or admins can view all" ON user_carts;
DROP POLICY IF EXISTS "Users can update own cart items or admins can update any" ON user_carts;
DROP POLICY IF EXISTS "Users can delete own cart items or admins can delete any" ON user_carts;
DROP POLICY IF EXISTS "Users can delete their own wishlists or admins can delete any" ON wishlists;
DROP POLICY IF EXISTS "Users can view their own wishlists or admins can view all" ON wishlists;
DROP POLICY IF EXISTS "Users can view own profile or admins can view all" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
DROP POLICY IF EXISTS "Users can manage own sessions or admins can view all" ON user_sessions;

-- Remove super_admin from the enum safely
DO $$ 
BEGIN
    -- Check if super_admin value exists in the enum
    IF EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'super_admin' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
    ) THEN
        -- Remove the default constraint temporarily
        ALTER TABLE public.profiles ALTER COLUMN role DROP DEFAULT;
        
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

-- Recreate all RLS policies with the new enum
CREATE POLICY "Users can view own cart items or admins can view all" ON user_carts
FOR SELECT USING (
    (auth.uid() = user_id) OR 
    (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'superadmin')))
);

CREATE POLICY "Users can update own cart items or admins can update any" ON user_carts
FOR UPDATE USING (
    (auth.uid() = user_id) OR 
    (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'superadmin')))
);

CREATE POLICY "Users can delete own cart items or admins can delete any" ON user_carts
FOR DELETE USING (
    (auth.uid() = user_id) OR 
    (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'superadmin')))
);

CREATE POLICY "Users can delete their own wishlists or admins can delete any" ON wishlists
FOR DELETE USING (
    (auth.uid() = user_id) OR 
    (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'superadmin')))
);

CREATE POLICY "Users can view their own wishlists or admins can view all" ON wishlists
FOR SELECT USING (
    (auth.uid() = user_id) OR 
    (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'superadmin')))
);

CREATE POLICY "Users can view own profile or admins can view all" ON profiles
FOR SELECT USING (
    (auth.uid() = id) OR 
    (EXISTS (SELECT 1 FROM profiles p2 WHERE p2.id = auth.uid() AND p2.role IN ('admin', 'superadmin')))
);

CREATE POLICY "Admins can update any profile" ON profiles
FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles p2 WHERE p2.id = auth.uid() AND p2.role IN ('admin', 'superadmin'))
);

CREATE POLICY "Users can manage own sessions or admins can view all" ON user_sessions
FOR ALL USING (
    (user_id = auth.uid()) OR 
    (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'superadmin')))
);