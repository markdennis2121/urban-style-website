
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can insert contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Admins can view all contact messages" ON contact_messages;
DROP POLICY IF EXISTS "contact_messages_insert_policy" ON contact_messages;
DROP POLICY IF EXISTS "contact_messages_select_policy" ON contact_messages;

-- Drop table if exists to recreate with proper setup
DROP TABLE IF EXISTS contact_messages;

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

-- Grant all permissions to both anon and authenticated users
GRANT ALL ON contact_messages TO anon;
GRANT ALL ON contact_messages TO authenticated;
GRANT ALL ON contact_messages TO public;

-- Grant schema usage to anon
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Create a permissive insert policy for everyone (anon and authenticated)
CREATE POLICY "allow_insert_contact_messages" ON contact_messages
    FOR INSERT 
    TO anon, authenticated
    WITH CHECK (true);

-- Create policy for viewing messages (authenticated users only, and only admins)
CREATE POLICY "allow_select_contact_messages" ON contact_messages
    FOR SELECT 
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'super_admin')
        )
    );
