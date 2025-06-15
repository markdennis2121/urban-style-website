
import { securityMonitor, SecurityEventType } from './monitoring';

interface ThreatPattern {
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  detect: (events: any[], context: any) => boolean;
}

class ThreatDetectionEngine {
  private patterns: ThreatPattern[] = [
    {
      name: 'Brute Force Attack',
      description: 'Multiple failed login attempts from same source',
      severity: 'high',
      detect: (events, context) => {
        const failedLogins = events.filter(e => 
          e.type === 'login_failure' && 
          e.ip === context.ip &&
          e.timestamp > Date.now() - 300000 // 5 minutes
        );
        return failedLogins.length >= 10;
      }
    },
    {
      name: 'Credential Stuffing',
      description: 'Login attempts with multiple usernames from same IP',
      severity: 'high',
      detect: (events, context) => {
        const loginAttempts = events.filter(e => 
          e.type === 'login_attempt' && 
          e.ip === context.ip &&
          e.timestamp > Date.now() - 600000 // 10 minutes
        );
        const uniqueUsers = new Set(loginAttempts.map(e => e.username));
        return uniqueUsers.size >= 20;
      }
    },
    {
      name: 'Admin Privilege Escalation',
      description: 'Suspicious admin access patterns',
      severity: 'critical',
      detect: (events, context) => {
        const adminAccess = events.filter(e => 
          e.type === 'admin_access' &&
          e.user_id === context.userId &&
          e.timestamp > Date.now() - 3600000 // 1 hour
        );
        return adminAccess.length >= 50; // Too many admin actions
      }
    },
    {
      name: 'Data Harvesting',
      description: 'Excessive data access requests',
      severity: 'medium',
      detect: (events, context) => {
        const dataAccess = events.filter(e => 
          e.type === 'data_access' &&
          e.user_id === context.userId &&
          e.timestamp > Date.now() - 1800000 // 30 minutes
        );
        return dataAccess.length >= 100;
      }
    },
    {
      name: 'Geolocation Anomaly',
      description: 'Login from unusual geographic location',
      severity: 'medium',
      detect: (events, context) => {
        const recentLogins = events.filter(e => 
          e.type === 'login_success' &&
          e.user_id === context.userId &&
          e.timestamp > Date.now() - 86400000 // 24 hours
        );
        
        const locations = recentLogins.map(e => e.location?.country).filter(Boolean);
        const uniqueCountries = new Set(locations);
        return uniqueCountries.size >= 3; // Logins from 3+ countries in 24h
      }
    },
    {
      name: 'Session Hijacking',
      description: 'Multiple concurrent sessions from different locations',
      severity: 'high',
      detect: (events, context) => {
        const activeSessions = events.filter(e => 
          e.type === 'session_active' &&
          e.user_id === context.userId
        );
        
        const uniqueIPs = new Set(activeSessions.map(e => e.ip));
        return uniqueIPs.size >= 3; // Sessions from 3+ IPs simultaneously
      }
    }
  ];

  async analyzeEvents(events: any[], context: any): Promise<ThreatPattern[]> {
    const detectedThreats: ThreatPattern[] = [];

    for (const pattern of this.patterns) {
      try {
        if (pattern.detect(events, context)) {
          detectedThreats.push(pattern);
          
          // Log the threat detection
          await securityMonitor.logSecurityEvent({
            event_type: SecurityEventType.SUSPICIOUS_ACTIVITY,
            user_id: context.userId,
            details: {
              threat: pattern.name,
              description: pattern.description,
              severity: pattern.severity
            },
            severity: pattern.severity,
            source: 'threat_detection'
          });
        }
      } catch (error) {
        console.error(`Error in threat pattern ${pattern.name}:`, error);
      }
    }

    return detectedThreats;
  }

  async respondToThreats(threats: ThreatPattern[], context: any) {
    for (const threat of threats) {
      switch (threat.severity) {
        case 'critical':
          await this.handleCriticalThreat(threat, context);
          break;
        case 'high':
          await this.handleHighThreat(threat, context);
          break;
        case 'medium':
          await this.handleMediumThreat(threat, context);
          break;
        case 'low':
          await this.handleLowThreat(threat, context);
          break;
      }
    }
  }

  private async handleCriticalThreat(threat: ThreatPattern, context: any) {
    // Immediately block user/IP
    // Send real-time alert
    // Log incident for investigation
    console.error(`CRITICAL THREAT DETECTED: ${threat.name}`);
  }

  private async handleHighThreat(threat: ThreatPattern, context: any) {
    // Temporary block
    // Enhanced monitoring
    // Alert security team
    console.warn(`HIGH THREAT DETECTED: ${threat.name}`);
  }

  private async handleMediumThreat(threat: ThreatPattern, context: any) {
    // Increase monitoring
    // Rate limit
    // Log for analysis
    console.warn(`MEDIUM THREAT DETECTED: ${threat.name}`);
  }

  private async handleLowThreat(threat: ThreatPattern, context: any) {
    // Log for trends
    // Minimal response
    console.info(`LOW THREAT DETECTED: ${threat.name}`);
  }
}

export const threatDetectionEngine = new ThreatDetectionEngine();
