
import { RateLimiter } from '@/lib/security';

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs?: number;
  progressive?: boolean;
}

interface AttemptRecord {
  count: number;
  lastAttempt: number;
  blockUntil?: number;
  progressiveMultiplier?: number;
}

export class AdvancedRateLimiter extends RateLimiter {
  private advancedAttempts: Map<string, AttemptRecord> = new Map();
  private config: RateLimitConfig;
  private blockedIPs: Set<string> = new Set();

  constructor(config: RateLimitConfig) {
    super(config.maxAttempts, config.windowMs);
    this.config = {
      blockDurationMs: 15 * 60 * 1000, // 15 minutes default
      progressive: true,
      ...config
    };
  }

  isAllowed(identifier: string, ip?: string): boolean {
    // Check if IP is globally blocked
    if (ip && this.blockedIPs.has(ip)) {
      return false;
    }

    const now = Date.now();
    const record = this.advancedAttempts.get(identifier);

    // Check if user is temporarily blocked
    if (record?.blockUntil && now < record.blockUntil) {
      return false;
    }

    // Clean expired block
    if (record?.blockUntil && now >= record.blockUntil) {
      record.blockUntil = undefined;
      record.progressiveMultiplier = 1;
    }

    // Standard rate limiting check
    if (!record) {
      this.advancedAttempts.set(identifier, {
        count: 1,
        lastAttempt: now,
        progressiveMultiplier: 1
      });
      return true;
    }

    // Reset window if enough time has passed
    if (now - record.lastAttempt > this.config.windowMs) {
      this.advancedAttempts.set(identifier, {
        count: 1,
        lastAttempt: now,
        progressiveMultiplier: record.progressiveMultiplier || 1
      });
      return true;
    }

    // Increment attempt count
    record.count++;
    record.lastAttempt = now;

    // Check if limit exceeded
    if (record.count > this.config.maxAttempts) {
      this.blockUser(identifier, record);
      if (ip) this.handleSuspiciousIP(ip, record.count);
      return false;
    }

    return true;
  }

  private blockUser(identifier: string, record: AttemptRecord) {
    const multiplier = this.config.progressive ? (record.progressiveMultiplier || 1) : 1;
    const blockDuration = (this.config.blockDurationMs || 0) * multiplier;
    
    record.blockUntil = Date.now() + blockDuration;
    record.progressiveMultiplier = Math.min((record.progressiveMultiplier || 1) * 2, 16);

    console.warn(`User ${identifier} blocked for ${blockDuration}ms (multiplier: ${multiplier})`);
  }

  private handleSuspiciousIP(ip: string, attemptCount: number) {
    // Block IP globally if too many attempts from same IP
    if (attemptCount > this.config.maxAttempts * 3) {
      this.blockedIPs.add(ip);
      console.warn(`IP ${ip} globally blocked due to excessive attempts`);
      
      // Auto-unblock after 1 hour
      setTimeout(() => {
        this.blockedIPs.delete(ip);
        console.info(`IP ${ip} auto-unblocked`);
      }, 60 * 60 * 1000);
    }
  }

  getBlockInfo(identifier: string): { blocked: boolean; timeRemaining?: number } {
    const record = this.advancedAttempts.get(identifier);
    
    if (record?.blockUntil) {
      const timeRemaining = record.blockUntil - Date.now();
      if (timeRemaining > 0) {
        return { blocked: true, timeRemaining };
      }
    }
    
    return { blocked: false };
  }

  unblockUser(identifier: string): void {
    const record = this.advancedAttempts.get(identifier);
    if (record) {
      record.blockUntil = undefined;
      record.count = 0;
      record.progressiveMultiplier = 1;
    }
  }

  isIPBlocked(ip: string): boolean {
    return this.blockedIPs.has(ip);
  }

  unblockIP(ip: string): void {
    this.blockedIPs.delete(ip);
  }

  getStats(): { 
    activeAttempts: number; 
    blockedUsers: number; 
    blockedIPs: number; 
  } {
    const now = Date.now();
    let blockedUsers = 0;

    for (const record of this.advancedAttempts.values()) {
      if (record.blockUntil && now < record.blockUntil) {
        blockedUsers++;
      }
    }

    return {
      activeAttempts: this.advancedAttempts.size,
      blockedUsers,
      blockedIPs: this.blockedIPs.size
    };
  }
}

// Enhanced rate limiters
export const enhancedAuthRateLimiter = new AdvancedRateLimiter({
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000,
  blockDurationMs: 15 * 60 * 1000,
  progressive: true
});

export const enhancedAPIRateLimiter = new AdvancedRateLimiter({
  maxAttempts: 100,
  windowMs: 60 * 1000,
  blockDurationMs: 5 * 60 * 1000,
  progressive: false
});

export const enhancedAdminRateLimiter = new AdvancedRateLimiter({
  maxAttempts: 10,
  windowMs: 10 * 60 * 1000,
  blockDurationMs: 30 * 60 * 1000,
  progressive: true
});
