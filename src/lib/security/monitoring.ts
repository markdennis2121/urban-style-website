
import { supabase } from '@/lib/supabase/client';

export enum SecurityEventType {
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILURE = 'login_failure',
  LOGIN_BLOCKED = 'login_blocked',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  ADMIN_ACCESS = 'admin_access',
  DATA_ACCESS = 'data_access',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  TWO_FA_ENABLED = 'two_fa_enabled',
  TWO_FA_DISABLED = 'two_fa_disabled',
  PASSWORD_CHANGED = 'password_changed',
  ACCOUNT_LOCKED = 'account_locked'
}

interface SecurityEvent {
  event_type: SecurityEventType;
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  details?: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
}

class SecurityMonitor {
  private static instance: SecurityMonitor;
  private eventQueue: SecurityEvent[] = [];
  private isProcessing = false;

  static getInstance(): SecurityMonitor {
    if (!SecurityMonitor.instance) {
      SecurityMonitor.instance = new SecurityMonitor();
    }
    return SecurityMonitor.instance;
  }

  async logSecurityEvent(event: Omit<SecurityEvent, 'ip_address' | 'user_agent'>) {
    try {
      const enrichedEvent: SecurityEvent = {
        ...event,
        ip_address: await this.getClientIP(),
        user_agent: navigator.userAgent,
      };

      this.eventQueue.push(enrichedEvent);
      
      if (!this.isProcessing) {
        this.processEventQueue();
      }
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  private async processEventQueue() {
    if (this.eventQueue.length === 0 || this.isProcessing) return;
    
    this.isProcessing = true;
    
    try {
      const events = [...this.eventQueue];
      this.eventQueue = [];

      await supabase.functions.invoke('log-security-events', {
        body: { events }
      });

      // Check for anomalies
      await this.detectAnomalies(events);
    } catch (error) {
      console.error('Failed to process security events:', error);
      // Re-queue failed events
      this.eventQueue.unshift(...this.eventQueue);
    } finally {
      this.isProcessing = false;
    }
  }

  private async detectAnomalies(events: SecurityEvent[]) {
    const suspiciousPatterns = [
      this.detectMultipleFailedLogins(events),
      this.detectUnusualAccessPatterns(events),
      this.detectRapidRequests(events)
    ];

    const anomalies = await Promise.all(suspiciousPatterns);
    const detectedAnomalies = anomalies.filter(Boolean);

    if (detectedAnomalies.length > 0) {
      await this.alertSecurityTeam(detectedAnomalies);
    }
  }

  private detectMultipleFailedLogins(events: SecurityEvent[]): boolean {
    const failedLogins = events.filter(e => e.event_type === SecurityEventType.LOGIN_FAILURE);
    return failedLogins.length >= 5;
  }

  private detectUnusualAccessPatterns(events: SecurityEvent[]): boolean {
    const adminAccess = events.filter(e => e.event_type === SecurityEventType.ADMIN_ACCESS);
    const uniqueIPs = new Set(adminAccess.map(e => e.ip_address));
    return uniqueIPs.size > 3; // Multiple IPs accessing admin
  }

  private detectRapidRequests(events: SecurityEvent[]): boolean {
    if (events.length < 10) return false;
    
    const timestamps = events.map(e => new Date().getTime());
    const timeSpan = Math.max(...timestamps) - Math.min(...timestamps);
    return timeSpan < 60000; // 10+ events in less than 1 minute
  }

  private async alertSecurityTeam(anomalies: any[]) {
    try {
      await supabase.functions.invoke('security-alert', {
        body: { anomalies, timestamp: new Date().toISOString() }
      });
    } catch (error) {
      console.error('Failed to send security alert:', error);
    }
  }

  private async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  }
}

export const securityMonitor = SecurityMonitor.getInstance();

// Helper functions for easy logging
export const logLoginSuccess = (userId: string) =>
  securityMonitor.logSecurityEvent({
    event_type: SecurityEventType.LOGIN_SUCCESS,
    user_id: userId,
    severity: 'low',
    source: 'auth'
  });

export const logLoginFailure = (email?: string, reason?: string) =>
  securityMonitor.logSecurityEvent({
    event_type: SecurityEventType.LOGIN_FAILURE,
    details: { email, reason },
    severity: 'medium',
    source: 'auth'
  });

export const logSuspiciousActivity = (userId: string, activity: string) =>
  securityMonitor.logSecurityEvent({
    event_type: SecurityEventType.SUSPICIOUS_ACTIVITY,
    user_id: userId,
    details: { activity },
    severity: 'high',
    source: 'general'
  });

export const logAdminAccess = (userId: string, action: string) =>
  securityMonitor.logSecurityEvent({
    event_type: SecurityEventType.ADMIN_ACCESS,
    user_id: userId,
    details: { action },
    severity: 'medium',
    source: 'admin'
  });
