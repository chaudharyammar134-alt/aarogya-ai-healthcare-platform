import { useEffect, useState } from 'react';
import { detectConnection, LazyLoader } from '../utils/performance';
import { connectionMonitor } from '../utils/offline';
import { serviceWorkerManager } from '../utils/sw-manager';

interface PerformanceOptimizerProps {
  children: React.ReactNode;
}

export function PerformanceOptimizer({ children }: PerformanceOptimizerProps) {
  const [connectionType, setConnectionType] = useState<'slow' | 'fast' | 'offline'>('fast');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lazyLoader] = useState(() => new LazyLoader());

  useEffect(() => {
    // Initialize service worker manager (handles inline SW registration)
    serviceWorkerManager.initialize().then((success) => {
      if (success) {
        console.log('Service Worker initialized successfully');
      } else {
        console.log('Service Worker not available - continuing without offline features');
      }
    });

    // Monitor connection changes
    const handleConnectionChange = (online: boolean) => {
      setIsOnline(online);
      setConnectionType(detectConnection());
    };

    connectionMonitor.onStatusChange(handleConnectionChange);

    // Setup lazy loading for images
    const images = document.querySelectorAll('img[data-src]');
    images.forEach((img) => lazyLoader.observe(img as HTMLElement));

    // Preload critical resources based on connection
    if (connectionType === 'fast') {
      preloadCriticalResources();
    }

    // Cleanup
    return () => {
      lazyLoader.disconnect();
    };
  }, [lazyLoader, connectionType]);

  const preloadCriticalResources = () => {
    // Preload essential images and assets
    const criticalImages = [
      '/icons/water.png',
      '/icons/meal.png',
      '/icons/exercise.png'
    ];

    criticalImages.forEach((src) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    });
  };

  return (
    <div className={`performance-wrapper ${connectionType === 'slow' ? 'low-bandwidth' : ''}`}>
      {/* Connection Status Indicator */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-red-500 text-white text-center py-2 text-sm z-50">
          📡 You're offline. Some features may be limited.
        </div>
      )}
      
      {connectionType === 'slow' && isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white text-center py-2 text-sm z-50">
          🐌 Slow connection detected. Loading optimized content.
        </div>
      )}

      {children}
    </div>
  );
}

// Lazy loading image component
interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
}

export function LazyImage({ src, alt, className = '', placeholder }: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState(placeholder || '');

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageSrc(src);
      setIsLoaded(true);
    };
    img.src = src;
  }, [src]);

  return (
    <div className={`relative ${className}`}>
      <img
        src={imageSrc}
        alt={alt}
        className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-70'}`}
      />
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
      )}
    </div>
  );
}

// Progressive enhancement wrapper
interface ProgressiveEnhancementProps {
  fallback: React.ReactNode;
  enhanced: React.ReactNode;
}

export function ProgressiveEnhancement({ fallback, enhanced }: ProgressiveEnhancementProps) {
  const [canEnhance, setCanEnhance] = useState(false);

  useEffect(() => {
    const connectionType = detectConnection();
    const hasModernFeatures = 'IntersectionObserver' in window && 'serviceWorker' in navigator;
    
    setCanEnhance(connectionType === 'fast' && hasModernFeatures);
  }, []);

  return canEnhance ? <>{enhanced}</> : <>{fallback}</>;
}