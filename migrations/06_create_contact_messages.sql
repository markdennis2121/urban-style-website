
-- Drop existing policies and table completely
DROP POLICY IF EXISTS "Anyone can insert contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Admins can view all contact messages" ON contact_messages;
DROP POLICY IF EXISTS "contact_messages_insert_policy" ON contact_messages;
DROP POLICY IF EXISTS "contact_messages_select_policy" ON contact_messages;
DROP POLICY IF EXISTS "allow_insert_contact_messages" ON contact_messages;
DROP POLICY IF EXISTS "allow_select_contact_messages" ON contact_messages;

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
CREATE POLICY "contact_messages_public_insert" ON contact_messages
    FOR INSERT 
    TO public
    WITH CHECK (true);

-- Create a select policy for authenticated admin users only
CREATE POLICY "contact_messages_admin_select" ON contact_messages
    FOR SELECT 
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'super_admin')
        )
    );
