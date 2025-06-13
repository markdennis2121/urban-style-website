-- Add new columns to profiles table
ALTER TABLE profiles
ADD COLUMN last_login TIMESTAMP WITH TIME ZONE,
ADD COLUMN failed_login_attempts INTEGER DEFAULT 0,
ADD COLUMN account_locked BOOLEAN DEFAULT false,
ADD COLUMN last_password_change TIMESTAMP WITH TIME ZONE;

-- Create audit log table
CREATE TABLE audit_logs (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    action VARCHAR(255) NOT NULL,
    details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create password policies table
CREATE TABLE password_policies (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    min_length INTEGER DEFAULT 8,
    require_uppercase BOOLEAN DEFAULT true,
    require_lowercase BOOLEAN DEFAULT true,
    require_numbers BOOLEAN DEFAULT true,
    require_special_chars BOOLEAN DEFAULT true,
    password_history_count INTEGER DEFAULT 3,
    max_age_days INTEGER DEFAULT 90,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sessions table
CREATE TABLE user_sessions (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    revoked BOOLEAN DEFAULT false
);

-- Create function to log audit events
CREATE OR REPLACE FUNCTION log_audit_event(
    p_user_id UUID,
    p_action VARCHAR,
    p_details JSONB,
    p_ip_address VARCHAR
) RETURNS UUID AS $$
DECLARE
    v_audit_id UUID;
BEGIN
    INSERT INTO audit_logs (user_id, action, details, ip_address)
    VALUES (p_user_id, p_action, p_details, p_ip_address)
    RETURNING id INTO v_audit_id;
    
    RETURN v_audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RLS policies
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Audit logs policies
CREATE POLICY "Admins can read all audit logs" ON audit_logs
    FOR SELECT TO authenticated
    USING (EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND (profiles.role = 'admin' OR profiles.role = 'super_admin')
    ));

-- Password policies policies
CREATE POLICY "Super admins can manage password policies" ON password_policies
    FOR ALL TO authenticated
    USING (EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'super_admin'
    ));

CREATE POLICY "Admins can read password policies" ON password_policies
    FOR SELECT TO authenticated
    USING (EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND (profiles.role = 'admin' OR profiles.role = 'super_admin')
    ));

-- Session policies
CREATE POLICY "Users can see their own sessions" ON user_sessions
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Admins can see all sessions" ON user_sessions
    FOR SELECT TO authenticated
    USING (EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND (profiles.role = 'admin' OR profiles.role = 'super_admin')
    ));

CREATE POLICY "Super admins can manage all sessions" ON user_sessions
    FOR ALL TO authenticated
    USING (EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'super_admin'
    ));

-- Insert default password policy
INSERT INTO password_policies (
    min_length,
    require_uppercase,
    require_lowercase,
    require_numbers,
    require_special_chars,
    password_history_count,
    max_age_days
) VALUES (
    8,  -- min length
    true,  -- require uppercase
    true,  -- require lowercase
    true,  -- require numbers
    true,  -- require special chars
    3,     -- password history
    90     -- max age days
);

-- Create trigger to update audit log on profile changes
CREATE OR REPLACE FUNCTION log_profile_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        PERFORM log_audit_event(
            auth.uid(),
            'profile_update',
            jsonb_build_object(
                'profile_id', NEW.id,
                'changes', jsonb_build_object(
                    'old_role', OLD.role,
                    'new_role', NEW.role
                )
            ),
            NULL
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER profile_audit_log
AFTER UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION log_profile_changes();
