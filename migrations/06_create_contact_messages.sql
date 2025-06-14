
-- Create contact_messages table
CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone (including anonymous users) to insert contact messages
CREATE POLICY "Anyone can insert contact messages" ON contact_messages
    FOR INSERT 
    TO public
    WITH CHECK (true);

-- Create policy for admins to view all contact messages
CREATE POLICY "Admins can view all contact messages" ON contact_messages
    FOR SELECT 
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- Grant necessary permissions
GRANT INSERT ON contact_messages TO anon, authenticated;
GRANT SELECT ON contact_messages TO authenticated;
