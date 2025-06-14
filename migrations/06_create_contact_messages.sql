
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can insert contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Admins can view all contact messages" ON contact_messages;

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

-- Grant permissions first
GRANT ALL ON contact_messages TO anon, authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Create policy to allow anyone (including anonymous users) to insert contact messages
CREATE POLICY "contact_messages_insert_policy" ON contact_messages
    FOR INSERT 
    WITH CHECK (true);

-- Create policy for admins to view all contact messages
CREATE POLICY "contact_messages_select_policy" ON contact_messages
    FOR SELECT 
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'super_admin')
        )
    );
