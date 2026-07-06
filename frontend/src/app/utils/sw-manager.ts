// Service Worker Manager - handles offline functionality gracefully

class ServiceWorkerManager {
  private isSupported: boolean;
  private registration: ServiceWorkerRegistration | null = null;

  constructor() {
    this.isSupported = 'serviceWorker' in navigator;
  }

  async initialize(): Promise<boolean> {
    if (!this.isSupported) {
      console.log('Service Worker not supported in this environment');
      return false;
    }

    try {
      // Create an inline service worker instead of loading from external file
      const swCode = this.getInlineServiceWorkerCode();
      const blob = new Blob([swCode], { type: 'application/javascript' });
      const swUrl = URL.createObjectURL(blob);
      
      this.registration = await navigator.serviceWorker.register(swUrl);
      console.log('Inline Service Worker registered successfully');
      
      // Clean up the blob URL
      URL.revokeObjectURL(swUrl);
      
      return true;
    } catch (error) {
      console.log('Service Worker registration failed:', (error as Error).message);
      return false;
    }
  }

  private getInlineServiceWorkerCode(): string {
    return `
// Inline Service Worker for Arogya+ AI
const CACHE_NAME = 'arogya-ai-v1';

// Basic caching functionality
self.addEventListener('install', (event) => {
  console.log('Service Worker installing');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating');
  event.waitUntil(self.clients.claim());
});

// Handle fetch events for offline functionality
self.addEventListener('fetch', (event) => {
  // Only handle same-origin requests
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // Return a simple offline response
          return new Response('Offline - Please check your connection', {
            status: 503,
            headers: { 'Content-Type': 'text/plain' }
          });
        })
    );
  }
});

// Handle push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Health reminder from Arogya+ AI',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [200, 100, 200],
    data: {
      url: '/',
      timestamp: Date.now()
    }
  };

  event.waitUntil(
    self.registration.showNotification('Arogya+ AI', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    self.clients.matchAll().then(clients => {
      if (clients.length > 0) {
        clients[0].focus();
      } else {
        self.clients.openWindow('/');
      }
    })
  );
});

// Handle background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'health-data-sync') {
    console.log('Background sync triggered for health data');
    // Simplified sync - just log for now
  }
});
`;
  }

  isServiceWorkerActive(): boolean {
    return this.registration !== null && this.registration.active !== null;
  }

  async showNotification(title: string, options?: NotificationOptions): Promise<void> {
    if (!this.registration) {
      // Fallback to basic browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, options);
      }
      return;
    }

    try {
      await this.registration.showNotification(title, options);
    } catch (error) {
      console.error('Failed to show notification:', error);
      // Fallback to basic browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, options);
      }
    }
  }

  async registerBackgroundSync(tag: string): Promise<void> {
    if (!this.registration || !this.registration.sync) {
      console.log('Background sync not supported');
      return;
    }

    try {
      await this.registration.sync.register(tag);
    } catch (error) {
      console.error('Failed to register background sync:', error);
    }
  }
}

// Export singleton instance
export const serviceWorkerManager = new ServiceWorkerManager();

// Auto-initialize
serviceWorkerManager.initialize().catch(console.error);