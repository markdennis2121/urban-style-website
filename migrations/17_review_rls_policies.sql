
-- Review and enhance RLS policies for security

-- Ensure profiles table has proper RLS policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Recreate profiles policies with better security
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update user profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Super admins can delete profiles" ON profiles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.role = 'super_admin'
    )
  );

-- Ensure products table has proper RLS policies
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view products" ON products;
DROP POLICY IF EXISTS "Admins can manage products" ON products;

CREATE POLICY "Anyone can view products" ON products
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage products" ON products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Ensure wishlists table has proper RLS policies
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own wishlists" ON wishlists;
DROP POLICY IF EXISTS "Admins can view all wishlists" ON wishlists;

CREATE POLICY "Users can manage own wishlists" ON wishlists
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all wishlists" ON wishlists
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can delete any wishlist" ON wishlists
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Ensure user_carts table has proper RLS policies
ALTER TABLE user_carts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own cart" ON user_carts;
DROP POLICY IF EXISTS "Admins can view all carts" ON user_carts;

CREATE POLICY "Users can manage own cart" ON user_carts
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all carts" ON user_carts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Ensure contact_messages table has proper RLS policies (if it exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'contact_messages') THEN
    ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Admins can view all messages" ON contact_messages;
    
    CREATE POLICY "Admins can view all messages" ON contact_messages
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE profiles.id = auth.uid() 
          AND profiles.role IN ('admin', 'super_admin')
        )
      );
  END IF;
END $$;

-- Ensure reviews table has proper RLS policies (if it exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'reviews') THEN
    ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Anyone can view reviews" ON reviews;
    DROP POLICY IF EXISTS "Users can manage own reviews" ON reviews;
    DROP POLICY IF EXISTS "Admins can view all reviews" ON reviews;
    
    CREATE POLICY "Anyone can view reviews" ON reviews
      FOR SELECT USING (true);
      
    CREATE POLICY "Users can manage own reviews" ON reviews
      FOR ALL USING (auth.uid() = user_id);
      
    CREATE POLICY "Admins can view all reviews" ON reviews
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE profiles.id = auth.uid() 
          AND profiles.role IN ('admin', 'super_admin')
        )
      );
  END IF;
END $$;

-- Create a function to validate admin access
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to validate super admin access
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
