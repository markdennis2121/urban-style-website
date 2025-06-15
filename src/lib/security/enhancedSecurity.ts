
import { supabase } from '@/lib/supabase/client';
import { sanitizeText, validateEmail } from '@/lib/security';
import { enhancedAuthRateLimiter } from './advancedRateLimit';
import { securityMonitor, logLoginFailure, logLoginSuccess, logSuspiciousActivity } from './monitoring';
import { threatDetectionEngine } from './threatDetection';
import { incidentResponseManager } from './incidentResponse';

// Enhanced security wrapper for all authentication operations
export class EnhancedSecurityManager {
  private static instance: EnhancedSecurityManager;

  static getInstance(): EnhancedSecurityManager {
    if (!EnhancedSecurityManager.instance) {
      EnhancedSecurityManager.instance = new EnhancedSecurityManager();
    }
    return EnhancedSecurityManager.instance;
  }

  async secureLogin(email: string, password: string, ip?: string): Promise<{
    success: boolean;
    data?: any;
    error?: string;
    requires2FA?: boolean;
    blockedUntil?: number;
  }> {
    const sanitizedEmail = sanitizeText(email);
    
    // Validate inputs
    if (!validateEmail(sanitizedEmail)) {
      await logLoginFailure(sanitizedEmail, 'Invalid email format');
      return { success: false, error: 'Invalid email format' };
    }

    // Check rate limiting
    if (!enhancedAuthRateLimiter.isAllowed(sanitizedEmail, ip)) {
      const blockInfo = enhancedAuthRateLimiter.getBlockInfo(sanitizedEmail);
      await logLoginFailure(sanitizedEmail, 'Rate limited');
      
      if (blockInfo.blocked) {
        return { 
          success: false, 
          error: 'Too many attempts. Please try again later.',
          blockedUntil: blockInfo.timeRemaining ? Date.now() + blockInfo.timeRemaining : undefined
        };
      }
    }

    try {
      // Attempt login
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password
      });

      if (authError) {
        await logLoginFailure(sanitizedEmail, authError.message);
        
        // Analyze for threat patterns
        await this.analyzeLoginFailure(sanitizedEmail, ip);
        
        if (authError.message.includes('Email not confirmed')) {
          return { success: false, error: 'Please verify your email first' };
        }
        
        return { success: false, error: 'Invalid credentials' };
      }

      if (!authData.user) {
        await logLoginFailure(sanitizedEmail, 'No user data returned');
        return { success: false, error: 'Authentication failed' };
      }

      // Check if 2FA is enabled
      const requires2FA = await this.check2FARequired(authData.user.id);
      
      if (requires2FA) {
        // Don't complete login yet, require 2FA
        await supabase.auth.signOut(); // Sign out until 2FA is verified
        return { 
          success: false, 
          requires2FA: true,
          data: { userId: authData.user.id }
        };
      }

      // Login successful
      await logLoginSuccess(authData.user.id);
      
      return { success: true, data: authData };
      
    } catch (error) {
      await logLoginFailure(sanitizedEmail, 'System error');
      return { success: false, error: 'System error occurred' };
    }
  }

  async verify2FALogin(userId: string, token: string): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      const { data, error } = await supabase.functions.invoke('verify-2fa-login', {
        body: { userId, token }
      });

      if (error || !data?.verified) {
        await logSuspiciousActivity(userId, '2FA verification failed');
        return { success: false, error: 'Invalid 2FA code' };
      }

      // Complete the login process
      const { data: authData, error: authError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: data.email
      });

      if (authError) {
        return { success: false, error: 'Failed to complete login' };
      }

      await logLoginSuccess(userId);
      return { success: true, data: authData };
      
    } catch (error) {
      return { success: false, error: 'System error occurred' };
    }
  }

  private async check2FARequired(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_security_settings')
        .select('two_factor_enabled')
        .eq('user_id', userId)
        .single();

      if (error) return false;
      return data?.two_factor_enabled || false;
    } catch {
      return false;
    }
  }

  private async analyzeLoginFailure(email: string, ip?: string) {
    // Collect recent events for analysis
    const context = { email, ip, timestamp: Date.now() };
    
    // Mock events for analysis (in real implementation, fetch from database)
    const recentEvents = [
      { type: 'login_failure', email, ip, timestamp: Date.now() }
    ];

    // Analyze for threat patterns
    const threats = await threatDetectionEngine.analyzeEvents(recentEvents, context);
    
    if (threats.length > 0) {
      // Create security incident if threats detected
      const incident = await incidentResponseManager.createIncident(
        'Suspicious Login Activity',
        threats[0].severity,
        `Multiple failed login attempts detected for ${email}`,
        recentEvents
      );
      
      console.warn(`Security incident created: ${incident}`);
    }
  }

  async auditUserAction(userId: string, action: string, details?: any) {
    await securityMonitor.logSecurityEvent({
      event_type: 'data_access' as any,
      user_id: userId,
      details: { action, ...details },
      severity: 'low',
      source: 'user_action'
    });
  }

  async validateAdminAction(userId: string, action: string): Promise<boolean> {
    try {
      // Check user permissions
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
        await logSuspiciousActivity(userId, `Unauthorized admin action: ${action}`);
        return false;
      }

      // Log admin action
      await securityMonitor.logSecurityEvent({
        event_type: 'admin_access' as any,
        user_id: userId,
        details: { action },
        severity: 'medium',
        source: 'admin'
      });

      return true;
    } catch {
      return false;
    }
  }
}

export const enhancedSecurity = EnhancedSecurityManager.getInstance();
