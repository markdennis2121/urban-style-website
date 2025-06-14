
-- Drop existing policies and table completely
DROP POLICY IF EXISTS "Anyone can insert contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Admins can view all contact messages" ON contact_messages;
DROP POLICY IF EXISTS "contact_messages_insert_policy" ON contact_messages;
DROP POLICY IF EXISTS "contact_messages_select_policy" ON contact_messages;
DROP POLICY IF EXISTS "allow_insert_contact_messages" ON contact_messages;
DROP POLICY IF EXISTS "allow_select_contact_messages" ON contact_messages;
DROP POLICY IF EXISTS "contact_messages_public_insert" ON contact_messages;
DROP POLICY IF EXISTS "contact_messages_admin_select" ON contact_messages;

-- Drop table completely to start fresh
DROP TABLE IF EXISTS contact_messages CASCADE;

-- Create contact_messages table
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

-- Grant necessary permissions to anon and authenticated users
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT INSERT ON contact_messages TO anon;
GRANT INSERT ON contact_messages TO authenticated;
GRANT SELECT ON contact_messages TO authenticated;

-- Create a simple insert policy that allows ANYONE (including anonymous users) to insert
CREATE POLICY "contact_messages_insert" ON contact_messages
    FOR INSERT 
    WITH CHECK (true);

-- Create a select policy for authenticated admin users only  
CREATE POLICY "contact_messages_select" ON contact_messages
    FOR SELECT 
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- Fix the reviews functionality - create reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id VARCHAR(50) NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    user_name VARCHAR(255) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Grant permissions for reviews
GRANT SELECT ON reviews TO anon;
GRANT SELECT ON reviews TO authenticated;
GRANT INSERT ON reviews TO authenticated;
GRANT UPDATE ON reviews TO authenticated;

-- Create policies for reviews
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

-- Create wishlists table
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

-- Enable RLS for wishlists
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

-- Grant permissions for wishlists
GRANT SELECT ON wishlists TO authenticated;
GRANT INSERT ON wishlists TO authenticated;
GRANT DELETE ON wishlists TO authenticated;

-- Create policies for wishlists
CREATE POLICY "wishlists_policy" ON wishlists
    FOR ALL 
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Add missing columns to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_new_arrival BOOLEAN DEFAULT false;

-- Update some products to be featured and new arrivals for testing (using product names instead of IDs)
UPDATE products SET is_featured = true WHERE name IN ('Cartoon Astronaut T-shirt', 'OversizeObsession', 'MaxComfort');
UPDATE products SET is_new_arrival = true WHERE name IN ('SlouchyStyle', 'GiantGarb', 'FreeFlow');
