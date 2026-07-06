// Fallback storage for environments without IndexedDB or ServiceWorker support

interface FallbackData {
  [key: string]: any;
}

class FallbackStorageService {
  private storage: FallbackData = {};
  private storageKey = 'arogya_ai_fallback_storage';

  constructor() {
    this.loadFromLocalStorage();
  }

  private loadFromLocalStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.storage = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load from localStorage:', error);
      this.storage = {};
    }
  }

  private saveToLocalStorage(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.storage));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  }

  async store(type: string, data: any, id?: string): Promise<string> {
    const itemId = id || `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const key = `${type}_${itemId}`;
    
    this.storage[key] = {
      id: itemId,
      type,
      data,
      timestamp: Date.now(),
      synced: navigator.onLine
    };
    
    this.saveToLocalStorage();
    return itemId;
  }

  async get(id: string): Promise<any | null> {
    const keys = Object.keys(this.storage);
    const key = keys.find(k => this.storage[k].id === id);
    return key ? this.storage[key] : null;
  }

  async getByType(type: string): Promise<any[]> {
    const results = Object.values(this.storage)
      .filter((item: any) => item.type === type);
    return results;
  }

  async clear(): Promise<void> {
    this.storage = {};
    this.saveToLocalStorage();
  }

  async clearType(type: string): Promise<void> {
    const keysToDelete = Object.keys(this.storage)
      .filter(key => this.storage[key].type === type);
    
    keysToDelete.forEach(key => {
      delete this.storage[key];
    });
    
    this.saveToLocalStorage();
  }

  getStorageInfo(): { totalItems: number; types: string[]; totalSize: string } {
    const items = Object.values(this.storage);
    const types = [...new Set(items.map((item: any) => item.type))];
    const sizeBytes = JSON.stringify(this.storage).length;
    const totalSize = sizeBytes > 1024 ? `${(sizeBytes / 1024).toFixed(1)}KB` : `${sizeBytes}B`;
    
    return {
      totalItems: items.length,
      types,
      totalSize
    };
  }
}

export const fallbackStorage = new FallbackStorageService();