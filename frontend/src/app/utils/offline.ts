// Offline storage and sync utilities for rural connectivity

import { fallbackStorage } from './fallback-storage';

interface OfflineData {
  id: string;
  type: 'routine' | 'diet_plan' | 'progress' | 'user_data' | 'ai_recommendations';
  data: any;
  timestamp: number;
  synced: boolean;
}

interface SyncQueue {
  id: string;
  action: 'create' | 'update' | 'delete';
  type: string;
  data: any;
  timestamp: number;
}

class OfflineStorageService {
  private dbName = 'ArogyaAI_Offline';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    if (!('indexedDB' in window)) {
      console.log('IndexedDB not supported - using fallback storage');
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => {
        console.log('IndexedDB failed - using fallback storage');
        resolve(); // Don't reject, just continue with fallback
      };
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create offline data store
        if (!db.objectStoreNames.contains('offline_data')) {
          const offlineStore = db.createObjectStore('offline_data', { keyPath: 'id' });
          offlineStore.createIndex('type', 'type', { unique: false });
          offlineStore.createIndex('synced', 'synced', { unique: false });
        }
        
        // Create sync queue store
        if (!db.objectStoreNames.contains('sync_queue')) {
          const syncStore = db.createObjectStore('sync_queue', { keyPath: 'id' });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  async store(type: OfflineData['type'], data: any, id?: string): Promise<string> {
    // Use fallback storage if IndexedDB is not available
    if (!this.db) {
      return fallbackStorage.store(type, data, id);
    }
    
    const itemId = id || `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const offlineData: OfflineData = {
      id: itemId,
      type,
      data,
      timestamp: Date.now(),
      synced: navigator.onLine
    };
    
    const transaction = this.db.transaction(['offline_data'], 'readwrite');
    const store = transaction.objectStore('offline_data');
    
    return new Promise((resolve, reject) => {
      const request = store.put(offlineData);
      request.onsuccess = () => resolve(itemId);
      request.onerror = () => {
        // Fallback to localStorage if IndexedDB fails
        fallbackStorage.store(type, data, id).then(resolve).catch(reject);
      };
    });
  }

  async get(id: string): Promise<OfflineData | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transaction = this.db.transaction(['offline_data'], 'readonly');
    const store = transaction.objectStore('offline_data');
    
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getByType(type: OfflineData['type']): Promise<OfflineData[]> {
    // Use fallback storage if IndexedDB is not available
    if (!this.db) {
      return fallbackStorage.getByType(type);
    }
    
    const transaction = this.db.transaction(['offline_data'], 'readonly');
    const store = transaction.objectStore('offline_data');
    const index = store.index('type');
    
    return new Promise((resolve, reject) => {
      const request = index.getAll(type);
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => {
        // Fallback to localStorage if IndexedDB fails
        fallbackStorage.getByType(type).then(resolve).catch(reject);
      };
    });
  }

  async addToSyncQueue(action: SyncQueue['action'], type: string, data: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const syncItem: SyncQueue = {
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      action,
      type,
      data,
      timestamp: Date.now()
    };
    
    const transaction = this.db.transaction(['sync_queue'], 'readwrite');
    const store = transaction.objectStore('sync_queue');
    
    return new Promise((resolve, reject) => {
      const request = store.add(syncItem);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getSyncQueue(): Promise<SyncQueue[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transaction = this.db.transaction(['sync_queue'], 'readonly');
    const store = transaction.objectStore('sync_queue');
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async clearSyncQueue(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transaction = this.db.transaction(['sync_queue'], 'readwrite');
    const store = transaction.objectStore('sync_queue');
    
    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async syncWhenOnline(): Promise<void> {
    if (!navigator.onLine) return;
    
    try {
      const syncQueue = await this.getSyncQueue();
      
      for (const item of syncQueue) {
        try {
          // Simulate API sync (replace with actual API calls)
          await this.simulateApiSync(item);
          console.log(`Synced: ${item.type} - ${item.action}`);
        } catch (error) {
          console.error(`Failed to sync ${item.id}:`, error);
        }
      }
      
      // Clear queue after successful sync
      await this.clearSyncQueue();
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }

  private async simulateApiSync(item: SyncQueue): Promise<void> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // In real implementation, this would be actual API calls
    switch (item.type) {
      case 'routine':
        // POST/PUT/DELETE to /api/routines
        break;
      case 'progress':
        // POST/PUT/DELETE to /api/progress
        break;
      case 'user_data':
        // POST/PUT/DELETE to /api/user
        break;
      default:
        break;
    }
  }
}

// Smart caching for frequently accessed data
class SmartCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  
  set(key: string, data: any, ttl: number = 5 * 60 * 1000): void { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }
  
  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.timestamp + item.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  size(): number {
    return this.cache.size;
  }
}

// Connection status monitoring
class ConnectionMonitor {
  private listeners: Array<(status: boolean) => void> = [];
  
  constructor() {
    window.addEventListener('online', () => this.notifyListeners(true));
    window.addEventListener('offline', () => this.notifyListeners(false));
  }
  
  onStatusChange(callback: (isOnline: boolean) => void): void {
    this.listeners.push(callback);
  }
  
  private notifyListeners(isOnline: boolean): void {
    this.listeners.forEach(callback => callback(isOnline));
  }
  
  isOnline(): boolean {
    return navigator.onLine;
  }
}

// Export singleton instances
export const offlineStorage = new OfflineStorageService();
export const smartCache = new SmartCache();
export const connectionMonitor = new ConnectionMonitor();

// Initialize offline storage
offlineStorage.init().catch(console.error);

// Auto-sync when coming online
connectionMonitor.onStatusChange((isOnline) => {
  if (isOnline) {
    offlineStorage.syncWhenOnline();
  }
});