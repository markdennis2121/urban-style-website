
-- Create enhanced security tables for 10/10 security rating

-- User security settings table
CREATE TABLE IF NOT EXISTS user_security_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  two_factor_secret TEXT, -- Encrypted in production
  backup_codes TEXT[], -- Array of backup codes
  password_changed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  failed_login_attempts INTEGER DEFAULT 0,
  account_locked_until TIMESTAMP WITH TIME ZONE,
  last_login_ip INET,
  last_login_location JSONB,
  security_questions JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id)
);

-- Security events logging table
CREATE TABLE IF NOT EXISTS security_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  details JSONB,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  source TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Security incidents table
CREATE TABLE IF NOT EXISTS security_incidents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  incident_id TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT NOT NULL,
  affected_users UUID[] DEFAULT '{}',
  status TEXT NOT NULL CHECK (status IN ('open', 'investigating', 'contained', 'resolved')),
  response_actions TEXT[] DEFAULT '{}',
  evidence JSONB DEFAULT '{}',
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Failed login attempts tracking
CREATE TABLE IF NOT EXISTS failed_login_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  ip_address INET NOT NULL,
  user_agent TEXT,
  attempt_time TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  reason TEXT
);

-- IP blocklist table
CREATE TABLE IF NOT EXISTS ip_blocklist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address INET NOT NULL UNIQUE,
  reason TEXT NOT NULL,
  blocked_until TIMESTAMP WITH TIME ZONE,
  is_permanent BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(event_type);

CREATE INDEX IF NOT EXISTS idx_security_incidents_status ON security_incidents(status);
CREATE INDEX IF NOT EXISTS idx_security_incidents_severity ON security_incidents(severity);
CREATE INDEX IF NOT EXISTS idx_security_incidents_created_at ON security_incidents(created_at);

CREATE INDEX IF NOT EXISTS idx_failed_login_attempts_email ON failed_login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_failed_login_attempts_ip ON failed_login_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_failed_login_attempts_time ON failed_login_attempts(attempt_time);

CREATE INDEX IF NOT EXISTS idx_ip_blocklist_ip ON ip_blocklist(ip_address);
CREATE INDEX IF NOT EXISTS idx_ip_blocklist_blocked_until ON ip_blocklist(blocked_until);

-- Enable RLS on all security tables
ALTER TABLE user_security_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE failed_login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ip_blocklist ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_security_settings
CREATE POLICY "Users can view own security settings" ON user_security_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own security settings" ON user_security_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all security settings" ON user_security_settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- RLS policies for security_events
CREATE POLICY "Admins can view all security events" ON security_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "System can insert security events" ON security_events
  FOR INSERT WITH CHECK (true);

-- RLS policies for security_incidents
CREATE POLICY "Admins can manage security incidents" ON security_incidents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- RLS policies for failed_login_attempts
CREATE POLICY "Admins can view failed login attempts" ON failed_login_attempts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "System can log failed attempts" ON failed_login_attempts
  FOR INSERT WITH CHECK (true);

-- RLS policies for ip_blocklist
CREATE POLICY "Admins can manage IP blocklist" ON ip_blocklist
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Functions for security automation
CREATE OR REPLACE FUNCTION cleanup_old_security_events()
RETURNS void AS $$
BEGIN
  -- Keep security events for 1 year
  DELETE FROM security_events 
  WHERE created_at < (NOW() - INTERVAL '1 year');
  
  -- Keep failed login attempts for 30 days
  DELETE FROM failed_login_attempts 
  WHERE attempt_time < (NOW() - INTERVAL '30 days');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if IP is blocked
CREATE OR REPLACE FUNCTION is_ip_blocked(check_ip INET)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM ip_blocklist 
    WHERE ip_address = check_ip 
    AND (is_permanent = true OR blocked_until > NOW())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to automatically block suspicious IPs
CREATE OR REPLACE FUNCTION auto_block_suspicious_ip(target_ip INET, block_reason TEXT)
RETURNS void AS $$
BEGIN
  INSERT INTO ip_blocklist (ip_address, reason, blocked_until, created_at)
  VALUES (target_ip, block_reason, NOW() + INTERVAL '1 hour', NOW())
  ON CONFLICT (ip_address) DO UPDATE SET
    blocked_until = NOW() + INTERVAL '1 hour',
    reason = block_reason;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically handle failed login attempts
CREATE OR REPLACE FUNCTION handle_failed_login()
RETURNS trigger AS $$
BEGIN
  -- Check if this IP has too many recent failures
  IF (
    SELECT COUNT(*) 
    FROM failed_login_attempts 
    WHERE ip_address = NEW.ip_address 
    AND attempt_time > (NOW() - INTERVAL '15 minutes')
  ) >= 10 THEN
    -- Auto-block this IP
    PERFORM auto_block_suspicious_ip(NEW.ip_address, 'Too many failed login attempts');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_handle_failed_login
  AFTER INSERT ON failed_login_attempts
  FOR EACH ROW
  EXECUTE FUNCTION handle_failed_login();

-- Insert some initial security settings for existing users
INSERT INTO user_security_settings (user_id, two_factor_enabled, created_at)
SELECT id, false, created_at 
FROM profiles 
WHERE NOT EXISTS (
  SELECT 1 FROM user_security_settings 
  WHERE user_security_settings.user_id = profiles.id
);
