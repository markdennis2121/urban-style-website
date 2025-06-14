
-- Drop existing policies and table completely to start fresh
DROP POLICY IF EXISTS "Anyone can insert contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Admins can view all contact messages" ON contact_messages;
DROP POLICY IF EXISTS "contact_messages_insert_policy" ON contact_messages;
DROP POLICY IF EXISTS "contact_messages_select_policy" ON contact_messages;
DROP POLICY IF EXISTS "allow_insert_contact_messages" ON contact_messages;
DROP POLICY IF EXISTS "allow_select_contact_messages" ON contact_messages;
DROP POLICY IF EXISTS "contact_messages_public_insert" ON contact_messages;
DROP POLICY IF EXISTS "contact_messages_admin_select" ON contact_messages;
DROP POLICY IF EXISTS "contact_messages_insert" ON contact_messages;
DROP POLICY IF EXISTS "contact_messages_select" ON contact_messages;
DROP POLICY IF EXISTS "contact_insert" ON contact_messages;
DROP POLICY IF EXISTS "contact_select" ON contact_messages;
DROP POLICY IF EXISTS "anyone_can_insert_contact_messages" ON contact_messages;
DROP POLICY IF EXISTS "admins_can_view_contact_messages" ON contact_messages;
DROP POLICY IF EXISTS "public_contact_insert" ON contact_messages;
DROP POLICY IF EXISTS "authenticated_contact_select" ON contact_messages;

-- Drop table completely to start fresh
DROP TABLE IF EXISTS contact_messages CASCADE;

-- Create contact_messages table with proper structure
CREATE TABLE contact_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions to both anon and authenticated users
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT INSERT ON contact_messages TO anon, authenticated;
GRANT SELECT ON contact_messages TO authenticated;

-- Create simple policy for anyone to insert contact messages (no complex conditions)
CREATE POLICY "contact_messages_insert_policy" ON contact_messages
    FOR INSERT 
    WITH CHECK (true);

-- Create policy for authenticated users to view contact messages 
CREATE POLICY "contact_messages_select_policy" ON contact_messages
    FOR SELECT 
    TO authenticated
    USING (true);

-- Ensure profiles table exists with proper structure
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    username VARCHAR(50),
    email VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    full_name VARCHAR(255),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "profiles_select_policy" ON profiles
    FOR SELECT 
    USING (true);

-- Create reviews table if it doesn't exist
CREATE TABLE IF NOT EXISTS reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id VARCHAR(50) NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    user_name VARCHAR(255) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON reviews TO anon, authenticated;
GRANT INSERT ON reviews TO authenticated;
GRANT UPDATE ON reviews TO authenticated;

DROP POLICY IF EXISTS "reviews_select_policy" ON reviews;
DROP POLICY IF EXISTS "reviews_insert_policy" ON reviews;
DROP POLICY IF EXISTS "reviews_update_policy" ON reviews;

CREATE POLICY "reviews_select_policy" ON reviews
    FOR SELECT 
    USING (true);

CREATE POLICY "reviews_insert_policy" ON reviews
    FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reviews_update_policy" ON reviews
    FOR UPDATE 
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create wishlists table if it doesn't exist
CREATE TABLE IF NOT EXISTS wishlists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    product_id VARCHAR(50) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_price DECIMAL(10,2) NOT NULL,
    product_image TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON wishlists TO authenticated;
GRANT INSERT ON wishlists TO authenticated;
GRANT DELETE ON wishlists TO authenticated;

DROP POLICY IF EXISTS "wishlists_policy" ON wishlists;

CREATE POLICY "wishlists_policy" ON wishlists
    FOR ALL 
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Add missing columns to products table if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'is_featured') THEN
        ALTER TABLE products ADD COLUMN is_featured BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'is_new_arrival') THEN
        ALTER TABLE products ADD COLUMN is_new_arrival BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Update some products to be featured and new arrivals for testing
UPDATE products SET is_featured = true WHERE name IN ('Cartoon Astronaut T-shirt', 'OversizeObsession', 'MaxComfort') AND EXISTS (SELECT 1 FROM products WHERE name IN ('Cartoon Astronaut T-shirt', 'OversizeObsession', 'MaxComfort'));
UPDATE products SET is_new_arrival = true WHERE name IN ('SlouchyStyle', 'GiantGarb', 'FreeFlow') AND EXISTS (SELECT 1 FROM products WHERE name IN ('SlouchyStyle', 'GiantGarb', 'FreeFlow'));
