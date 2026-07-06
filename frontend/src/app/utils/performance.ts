// Performance optimization utilities for rural/semi-urban connectivity

export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

export const compressImage = (file: File, quality: number = 0.7): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }
    
    const img = new Image();
    
    img.onload = () => {
      // Calculate compressed dimensions
      const maxWidth = 800;
      const maxHeight = 600;
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to compress image'));
        }
      }, 'image/jpeg', quality);
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = window.setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

export const detectConnection = (): 'slow' | 'fast' | 'offline' => {
  if (!navigator.onLine) return 'offline';
  
  // Check for NetworkInformation API
  const connection = (navigator as any).connection || 
                    (navigator as any).mozConnection || 
                    (navigator as any).webkitConnection;
  
  if (connection && connection.effectiveType) {
    const slowConnections = ['slow-2g', '2g', '3g'];
    if (slowConnections.includes(connection.effectiveType)) {
      return 'slow';
    }
  }
  
  return 'fast';
};

export class LazyLoader {
  private observer: IntersectionObserver;
  
  constructor() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.dataset.src;
          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
            this.observer.unobserve(img);
          }
        }
      });
    });
  }
  
  observe(element: HTMLElement): void {
    this.observer.observe(element);
  }
  
  disconnect(): void {
    this.observer.disconnect();
  }
}

export const loadScript = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

// Connection-aware loading
export async function adaptiveLoad<T>(
  fastLoad: () => Promise<T>,
  slowLoad: () => Promise<T>
): Promise<T> {
  const connectionType = detectConnection();
  
  if (connectionType === 'slow' || connectionType === 'offline') {
    return slowLoad();
  }
  
  return fastLoad();
}