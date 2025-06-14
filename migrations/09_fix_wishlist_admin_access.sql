
-- Fix RLS policies to allow admins and superadmins to view all wishlists

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view their own wishlists" ON wishlists;
DROP POLICY IF EXISTS "Users can insert their own wishlists" ON wishlists;
DROP POLICY IF EXISTS "Users can delete their own wishlists" ON wishlists;

-- Create new policies that allow admins and superadmins to access all wishlists
CREATE POLICY "Users can view their own wishlists" ON wishlists
  FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
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
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Also fix reviews policies for consistency
DROP POLICY IF EXISTS "Users can update their own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can delete their own reviews" ON reviews;

CREATE POLICY "Users can update their own reviews or admins can update any" ON reviews
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Users can delete their own reviews or admins can delete any" ON reviews
  FOR DELETE USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );
