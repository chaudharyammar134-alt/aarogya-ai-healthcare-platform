// Data optimization service for rural/semi-urban connectivity

import { detectConnection } from './performance';
import { smartCache } from './offline';

interface OptimizationConfig {
  connectionType: 'slow' | 'fast' | 'offline';
  dataUsage: 'minimal' | 'standard' | 'full';
  imageQuality: 'low' | 'medium' | 'high';
  enableAnimations: boolean;
  prefetchContent: boolean;
}

class DataOptimizationService {
  private config: OptimizationConfig;
  private dataUsageTracker = {
    session: 0,
    daily: 0,
    weekly: 0
  };

  constructor() {
    this.config = this.getOptimalConfig();
    this.loadDataUsage();
    this.setupConnectionMonitoring();
  }

  private getOptimalConfig(): OptimizationConfig {
    const connectionType = detectConnection();
    const isLowEndDevice = this.isLowEndDevice();
    const savedPreferences = this.getSavedPreferences();

    // Auto-optimize based on connection and device
    let config: OptimizationConfig = {
      connectionType,
      dataUsage: 'standard',
      imageQuality: 'medium',
      enableAnimations: true,
      prefetchContent: true
    };

    // Optimize for slow connections
    if (connectionType === 'slow') {
      config = {
        ...config,
        dataUsage: 'minimal',
        imageQuality: 'low',
        enableAnimations: false,
        prefetchContent: false
      };
    }

    // Optimize for low-end devices
    if (isLowEndDevice) {
      config = {
        ...config,
        enableAnimations: false,
        imageQuality: 'low'
      };
    }

    // Apply user preferences if available
    if (savedPreferences) {
      config = { ...config, ...savedPreferences };
    }

    return config;
  }

  private isLowEndDevice(): boolean {
    // Detect low-end devices based on hardware capabilities
    const memory = (navigator as any).deviceMemory;
    const cores = navigator.hardwareConcurrency;
    
    // Device has less than 2GB RAM or 2 cores
    if (memory && memory < 2) return true;
    if (cores && cores < 2) return true;
    
    // Check for older Android devices
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Android')) {
      const androidVersion = userAgent.match(/Android (\d+)/);
      if (androidVersion && parseInt(androidVersion[1]) < 8) return true;
    }
    
    return false;
  }

  private getSavedPreferences(): Partial<OptimizationConfig> | null {
    try {
      const saved = localStorage.getItem('arogya_optimization_preferences');
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      return null;
    }
  }

  private setupConnectionMonitoring(): void {
    // Monitor connection changes
    window.addEventListener('online', () => {
      this.updateConnectionType('fast');
    });

    window.addEventListener('offline', () => {
      this.updateConnectionType('offline');
    });

    // Monitor for connection type changes
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      connection?.addEventListener('change', () => {
        this.updateConnectionType(detectConnection());
      });
    }
  }

  private updateConnectionType(type: 'slow' | 'fast' | 'offline'): void {
    if (this.config.connectionType !== type) {
      this.config.connectionType = type;
      this.config = this.getOptimalConfig();
      this.notifyConfigChange();
    }
  }

  private notifyConfigChange(): void {
    // Notify components about configuration changes
    window.dispatchEvent(new CustomEvent('optimizationConfigChanged', {
      detail: this.config
    }));
  }

  // Public API methods
  getConfig(): OptimizationConfig {
    return this.config;
  }

  updatePreferences(preferences: Partial<OptimizationConfig>): void {
    this.config = { ...this.config, ...preferences };
    
    try {
      localStorage.setItem('arogya_optimization_preferences', JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to save optimization preferences:', error);
    }
    
    this.notifyConfigChange();
  }

  // Image optimization
  getOptimizedImageUrl(originalUrl: string, width?: number, height?: number): string {
    const { imageQuality, connectionType } = this.config;
    
    if (connectionType === 'offline') {
      // Return cached image or placeholder
      const cached = smartCache.get(`image_${originalUrl}`);
      return cached || this.getPlaceholderImage(width, height);
    }

    if (connectionType === 'slow' || imageQuality === 'low') {
      // Return compressed version
      return this.compressImageUrl(originalUrl, 0.5, width, height);
    }

    if (imageQuality === 'medium') {
      return this.compressImageUrl(originalUrl, 0.7, width, height);
    }

    return originalUrl;
  }

  private compressImageUrl(url: string, quality: number, width?: number, height?: number): string {
    // In a real implementation, this would use a CDN or image optimization service
    // For now, we'll return the original URL with query parameters that could be used by a CDN
    const params = new URLSearchParams();
    params.set('q', (quality * 100).toString());
    if (width) params.set('w', width.toString());
    if (height) params.set('h', height.toString());
    
    return `${url}?${params.toString()}`;
  }

  private getPlaceholderImage(width?: number, height?: number): string {
    const w = width || 200;
    const h = height || 200;
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f0f0f0"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#999" font-family="sans-serif" font-size="14">
          Loading...
        </text>
      </svg>
    `)}`;
  }

  // Content optimization
  shouldPrefetchContent(): boolean {
    return this.config.prefetchContent && this.config.connectionType === 'fast';
  }

  shouldShowAnimations(): boolean {
    return this.config.enableAnimations && this.config.connectionType !== 'slow';
  }

  getDataUsageLevel(): 'low' | 'medium' | 'high' {
    if (this.dataUsageTracker.session < 1024 * 1024) return 'low'; // < 1MB
    if (this.dataUsageTracker.session < 10 * 1024 * 1024) return 'medium'; // < 10MB
    return 'high';
  }

  // API optimization
  optimizeApiRequest(url: string, options: RequestInit = {}): RequestInit {
    const optimizedOptions = { ...options };
    
    // Add compression headers
    optimizedOptions.headers = {
      ...optimizedOptions.headers,
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept': 'application/json'
    };

    // Add cache headers for slow connections
    if (this.config.connectionType === 'slow') {
      optimizedOptions.headers = {
        ...optimizedOptions.headers,
        'Cache-Control': 'max-age=300' // 5 minutes cache
      };
    }

    return optimizedOptions;
  }

  // Data usage tracking
  trackDataUsage(bytes: number): void {
    this.dataUsageTracker.session += bytes;
    this.dataUsageTracker.daily += bytes;
    this.dataUsageTracker.weekly += bytes;
    
    this.saveDataUsage();
    
    // Warn if data usage is high
    if (this.getDataUsageLevel() === 'high') {
      this.showDataUsageWarning();
    }
  }

  private loadDataUsage(): void {
    try {
      const saved = localStorage.getItem('arogya_data_usage');
      if (saved) {
        const data = JSON.parse(saved);
        const now = new Date();
        
        // Reset daily usage if it's a new day
        if (data.lastReset && new Date(data.lastReset).getDate() !== now.getDate()) {
          data.daily = 0;
        }
        
        // Reset weekly usage if it's a new week
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (data.weeklyReset && new Date(data.weeklyReset) < weekAgo) {
          data.weekly = 0;
          data.weeklyReset = now.toISOString();
        }
        
        this.dataUsageTracker = {
          session: 0, // Always reset session usage
          daily: data.daily || 0,
          weekly: data.weekly || 0
        };
      }
    } catch (error) {
      console.error('Failed to load data usage:', error);
    }
  }

  private saveDataUsage(): void {
    try {
      const data = {
        ...this.dataUsageTracker,
        lastReset: new Date().toISOString(),
        weeklyReset: new Date().toISOString()
      };
      localStorage.setItem('arogya_data_usage', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save data usage:', error);
    }
  }

  private showDataUsageWarning(): void {
    if (this.dataUsageTracker.session > 50 * 1024 * 1024) { // 50MB
      console.warn('High data usage detected in this session');
      // In a real app, this would show a user-friendly notification
    }
  }

  // Network request optimization
  createOptimizedFetch() {
    const originalFetch = window.fetch;
    
    return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const url = typeof input === 'string' ? input : input.toString();
      const optimizedInit = this.optimizeApiRequest(url, init);
      
      try {
        const response = await originalFetch(input, optimizedInit);
        
        // Track data usage
        const contentLength = response.headers.get('content-length');
        if (contentLength) {
          this.trackDataUsage(parseInt(contentLength));
        }
        
        // Cache successful responses for offline use
        if (response.ok && this.shouldCacheResponse(url)) {
          const responseClone = response.clone();
          this.cacheResponse(url, responseClone);
        }
        
        return response;
      } catch (error) {
        // Try to serve from cache if offline
        if (!navigator.onLine) {
          const cachedResponse = await this.getCachedResponse(url);
          if (cachedResponse) {
            return cachedResponse;
          }
        }
        
        throw error;
      }
    };
  }

  private shouldCacheResponse(url: string): boolean {
    // Cache API responses but not large files
    return url.includes('/api/') && !url.includes('/upload') && !url.includes('/download');
  }

  private async cacheResponse(url: string, response: Response): Promise<void> {
    try {
      const data = await response.json();
      smartCache.set(`api_${url}`, data, 5 * 60 * 1000); // 5 minutes
    } catch (error) {
      // Response might not be JSON, that's ok
    }
  }

  private async getCachedResponse(url: string): Promise<Response | null> {
    const cachedData = smartCache.get(`api_${url}`);
    if (cachedData) {
      return new Response(JSON.stringify(cachedData), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    return null;
  }

  // Performance metrics
  getPerformanceMetrics() {
    return {
      connectionType: this.config.connectionType,
      dataUsage: this.dataUsageTracker,
      cacheSize: smartCache.size(),
      isLowEndDevice: this.isLowEndDevice(),
      optimizationLevel: this.config.dataUsage
    };
  }
}

// Create singleton instance
export const dataOptimizer = new DataOptimizationService();

// Replace global fetch with optimized version
window.fetch = dataOptimizer.createOptimizedFetch();

// Export utility functions
export const getOptimizedImageUrl = (url: string, width?: number, height?: number) => 
  dataOptimizer.getOptimizedImageUrl(url, width, height);

export const shouldPrefetchContent = () => dataOptimizer.shouldPrefetchContent();
export const shouldShowAnimations = () => dataOptimizer.shouldShowAnimations();
export const getDataUsageLevel = () => dataOptimizer.getDataUsageLevel();