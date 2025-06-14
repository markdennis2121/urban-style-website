
import DOMPurify from 'dompurify';

// Input sanitization utilities
export const sanitizeHtml = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: []
  });
};

export const sanitizeText = (input: string): string => {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Enhanced credit card validation
export const validateCreditCard = (cardNumber: string): { isValid: boolean; type: string } => {
  const cleanNumber = cardNumber.replace(/\s/g, '');
  
  // Luhn algorithm
  const luhnCheck = (num: string): boolean => {
    let sum = 0;
    let isEven = false;
    
    for (let i = num.length - 1; i >= 0; i--) {
      let digit = parseInt(num.charAt(i), 10);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  };
  
  // Card type detection
  const getCardType = (num: string): string => {
    if (/^4/.test(num)) return 'Visa';
    if (/^5[1-5]/.test(num)) return 'Mastercard';
    if (/^3[47]/.test(num)) return 'American Express';
    return 'Unknown';
  };
  
  return {
    isValid: /^\d{13,19}$/.test(cleanNumber) && luhnCheck(cleanNumber),
    type: getCardType(cleanNumber)
  };
};

// Phone number validation
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s|-|\(|\)/g, ''));
};

// Content Security Policy headers (for deployment)
export const getCSPHeaders = () => ({
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.supabase.co https://api.stripe.com",
    "frame-src https://js.stripe.com"
  ].join('; ')
});

// Rate limiting utility
export class RateLimiter {
  private attempts: Map<string, { count: number; lastAttempt: number }> = new Map();
  private maxAttempts: number;
  private windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const userAttempts = this.attempts.get(identifier);

    if (!userAttempts) {
      this.attempts.set(identifier, { count: 1, lastAttempt: now });
      return true;
    }

    if (now - userAttempts.lastAttempt > this.windowMs) {
      this.attempts.set(identifier, { count: 1, lastAttempt: now });
      return true;
    }

    if (userAttempts.count >= this.maxAttempts) {
      return false;
    }

    userAttempts.count++;
    userAttempts.lastAttempt = now;
    return true;
  }

  getRemainingTime(identifier: string): number {
    const userAttempts = this.attempts.get(identifier);
    if (!userAttempts || userAttempts.count < this.maxAttempts) {
      return 0;
    }
    
    const remaining = this.windowMs - (Date.now() - userAttempts.lastAttempt);
    return Math.max(0, remaining);
  }
}

export const authRateLimiter = new RateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes
export const checkoutRateLimiter = new RateLimiter(3, 5 * 60 * 1000); // 3 attempts per 5 minutes

// Session timeout management
export const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
export const WARNING_TIME = 5 * 60 * 1000; // 5 minutes before timeout

export const isSessionExpired = (lastActivity: number): boolean => {
  return Date.now() - lastActivity > SESSION_TIMEOUT;
};

export const shouldShowWarning = (lastActivity: number): boolean => {
  const timeLeft = SESSION_TIMEOUT - (Date.now() - lastActivity);
  return timeLeft <= WARNING_TIME && timeLeft > 0;
};
