import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Skeleton } from './skeleton';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  fallback?: string;
  onLoad?: () => void;
  onError?: () => void;
  priority?: boolean;
  placeholder?: boolean;
}

const OptimizedImage = React.memo(({ 
  src, 
  alt, 
  className = '', 
  width,
  height,
  fallback = '/placeholder.svg',
  onLoad,
  onError,
  priority = false,
  placeholder = true
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority) return; // Skip lazy loading for priority images
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );
    
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    
    observerRef.current = observer;
    
    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setIsError(true);
    onError?.();
  }, [onError]);

  const imageSrc = isError ? fallback : src;
  const shouldShowImage = isInView || priority;

  return (
    <div 
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {/* Placeholder/Skeleton */}
      {placeholder && !isLoaded && shouldShowImage && (
        <Skeleton className="absolute inset-0 bg-muted/30 animate-pulse" />
      )}
      
      {/* Actual Image */}
      {shouldShowImage && (
        <img
          src={imageSrc}
          alt={alt}
          width={width}
          height={height}
          onLoad={handleLoad}
          onError={handleError}
          className={`
            transition-opacity duration-300 transform-gpu
            ${isLoaded ? 'opacity-100' : 'opacity-0'}
            ${className}
          `}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          style={{
            willChange: 'opacity',
            backfaceVisibility: 'hidden',
            perspective: '1000px',
          }}
        />
      )}
      
      {/* Error state */}
      {isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/20 text-muted-foreground">
          <div className="text-center">
            <div className="text-2xl mb-2">🖼️</div>
            <p className="text-xs">Image failed to load</p>
          </div>
        </div>
      )}
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;