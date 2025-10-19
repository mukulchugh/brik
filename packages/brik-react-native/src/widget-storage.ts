/**
 * Widget State Persistence for Brik v0.3.0
 * Provides cross-platform state storage for widgets
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_PREFIX = '@brik_widget_';

export interface WidgetStorageOptions {
  encryption?: boolean;
  ttl?: number; // Time to live in seconds
}

/**
 * Widget Storage Manager
 * Handles persisting widget state across app restarts
 */
export class WidgetStorage {
  private prefix: string;

  constructor(namespace: string = 'default') {
    this.prefix = `${STORAGE_PREFIX}${namespace}_`;
  }

  /**
   * Save widget data
   */
  async save<T>(key: string, data: T, options?: WidgetStorageOptions): Promise<void> {
    try {
      const storageKey = this.prefix + key;
      const storageData = {
        data,
        timestamp: Date.now(),
        ttl: options?.ttl,
      };

      await AsyncStorage.setItem(storageKey, JSON.stringify(storageData));
    } catch (error) {
      console.error('[Brik] Failed to save widget data:', error);
      throw error;
    }
  }

  /**
   * Load widget data
   */
  async load<T>(key: string): Promise<T | null> {
    try {
      const storageKey = this.prefix + key;
      const raw = await AsyncStorage.getItem(storageKey);

      if (!raw) return null;

      const storageData = JSON.parse(raw);

      // Check TTL
      if (storageData.ttl) {
        const age = (Date.now() - storageData.timestamp) / 1000;
        if (age > storageData.ttl) {
          // Data expired, remove it
          await this.remove(key);
          return null;
        }
      }

      return storageData.data as T;
    } catch (error) {
      console.error('[Brik] Failed to load widget data:', error);
      return null;
    }
  }

  /**
   * Remove widget data
   */
  async remove(key: string): Promise<void> {
    try {
      const storageKey = this.prefix + key;
      await AsyncStorage.removeItem(storageKey);
    } catch (error) {
      console.error('[Brik] Failed to remove widget data:', error);
    }
  }

  /**
   * Clear all widget data in this namespace
   */
  async clear(): Promise<void> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const widgetKeys = allKeys.filter((key: string) => key.startsWith(this.prefix));
      await AsyncStorage.multiRemove(widgetKeys);
    } catch (error) {
      console.error('[Brik] Failed to clear widget data:', error);
    }
  }

  /**
   * Get all keys in this namespace
   */
  async getAllKeys(): Promise<string[]> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      return allKeys
        .filter((key: string) => key.startsWith(this.prefix))
        .map((key: string) => key.substring(this.prefix.length));
    } catch (error) {
      console.error('[Brik] Failed to get widget keys:', error);
      return [];
    }
  }

  /**
   * Check if key exists and is not expired
   */
  async exists(key: string): Promise<boolean> {
    const data = await this.load(key);
    return data !== null;
  }
}

/**
 * Default widget storage instance
 */
export const widgetStorage = new WidgetStorage();

/**
 * Widget cache manager for frequently accessed data
 */
export class WidgetCache<T = any> {
  private cache: Map<string, { data: T; timestamp: number; ttl: number }> = new Map();

  /**
   * Set cache data
   */
  set(key: string, data: T, ttlSeconds: number = 300): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlSeconds * 1000,
    });
  }

  /**
   * Get cache data
   */
  get(key: string): T | null {
    const cached = this.cache.get(key);

    if (!cached) return null;

    // Check if expired
    const age = Date.now() - cached.timestamp;
    if (age > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * Check if key exists in cache and is valid
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Invalidate cache entry
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get or fetch pattern
   */
  async getOrFetch<K>(
    key: string,
    fetchFn: () => Promise<K>,
    ttlSeconds: number = 300
  ): Promise<K> {
    const cached = this.get(key);
    if (cached !== null) {
      return cached as unknown as K;
    }

    const data = await fetchFn();
    this.set(key, data as unknown as T, ttlSeconds);
    return data;
  }
}

/**
 * Default cache instance
 */
export const widgetCache = new WidgetCache();
