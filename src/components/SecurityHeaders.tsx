
import { useEffect } from 'react';

const SecurityHeaders = () => {
  useEffect(() => {
    // Add security meta tags
    const addMetaTag = (name: string, content: string) => {
      const existing = document.querySelector(`meta[name="${name}"]`);
      if (existing) {
        existing.setAttribute('content', content);
      } else {
        const meta = document.createElement('meta');
        meta.name = name;
        meta.content = content;
        document.head.appendChild(meta);
      }
    };

    // Security headers via meta tags
    addMetaTag('referrer', 'strict-origin-when-cross-origin');
    addMetaTag('robots', 'index, follow');
    
    // Prevent MIME type sniffing
    const noSniff = document.createElement('meta');
    noSniff.setAttribute('http-equiv', 'X-Content-Type-Options');
    noSniff.content = 'nosniff';
    if (!document.querySelector('meta[http-equiv="X-Content-Type-Options"]')) {
      document.head.appendChild(noSniff);
    }

    // XSS Protection
    const xssProtection = document.createElement('meta');
    xssProtection.setAttribute('http-equiv', 'X-XSS-Protection');
    xssProtection.content = '1; mode=block';
    if (!document.querySelector('meta[http-equiv="X-XSS-Protection"]')) {
      document.head.appendChild(xssProtection);
    }

    // Frame options
    const frameOptions = document.createElement('meta');
    frameOptions.setAttribute('http-equiv', 'X-Frame-Options');
    frameOptions.content = 'DENY';
    if (!document.querySelector('meta[http-equiv="X-Frame-Options"]')) {
      document.head.appendChild(frameOptions);
    }
  }, []);

  return null;
};

export default SecurityHeaders;
