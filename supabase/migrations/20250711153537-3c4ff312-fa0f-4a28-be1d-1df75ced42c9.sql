
-- Fix RLS policies to allow admins and superadmins to view all data

-- Drop and recreate user_carts policies to allow admin access
DROP POLICY IF EXISTS "Users can view own cart items" ON user_carts;
DROP POLICY IF EXISTS "Users can insert own cart items" ON user_carts;
DROP POLICY IF EXISTS "Users can update own cart items" ON user_carts;
DROP POLICY IF EXISTS "Users can delete own cart items" ON user_carts;

-- Create new policies for user_carts that allow admin access
CREATE POLICY "Users can view own cart items or admins can view all" ON user_carts
  FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Users can insert own cart items" ON user_carts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart items or admins can update any" ON user_carts
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Users can delete own cart items or admins can delete any" ON user_carts
  FOR DELETE USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'superadmin')
    )
  );

-- Fix wishlists policies (some already exist but let's ensure consistency)
DROP POLICY IF EXISTS "Users can view their own wishlists" ON wishlists;
DROP POLICY IF EXISTS "Users can insert their own wishlists" ON wishlists;
DROP POLICY IF EXISTS "Users can delete their own wishlists" ON wishlists;

CREATE POLICY "Users can view their own wishlists or admins can view all" ON wishlists
  FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Users can insert their own wishlists" ON wishlists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wishlists or admins can delete any" ON wishlists
  FOR DELETE USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'superadmin')
    )
  );

-- Fix user_sessions policies to allow admin access
DROP POLICY IF EXISTS "sessions_own" ON user_sessions;

CREATE POLICY "Users can manage own sessions or admins can view all" ON user_sessions
  FOR ALL USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'superadmin')
    )
  );

-- Fix profiles policies to allow admin access for viewing other users
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;

CREATE POLICY "Users can view own profile or admins can view all" ON profiles
  FOR SELECT USING (
    auth.uid() = id OR 
    EXISTS (
      SELECT 1 FROM profiles p2
      WHERE p2.id = auth.uid() 
      AND p2.role IN ('admin', 'superadmin')
    )
  );

-- Ensure admins can update user profiles
CREATE POLICY "Admins can update any profile" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles p2
      WHERE p2.id = auth.uid() 
      AND p2.role IN ('admin', 'superadmin')
    )
  );
