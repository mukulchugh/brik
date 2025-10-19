/**
 * Tests for Widget Storage System (v0.3.0)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  WidgetStorage,
  WidgetCache,
  widgetStorage,
  widgetCache,
} from '../src/widget-storage';

// Reset mocks before each test
beforeEach(() => {
  (AsyncStorage as any).__reset();
  jest.clearAllTimers();
  jest.useRealTimers();
});

describe('WidgetStorage', () => {
  describe('save and load', () => {
    it('should save and load widget data', async () => {
      const storage = new WidgetStorage('test');
      const data = { orderId: '12345', status: 'preparing' };

      await storage.save('order', data);
      const loaded = await storage.load<typeof data>('order');

      expect(loaded).toEqual(data);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@brik_widget_test_order',
        expect.any(String)
      );
    });

    it('should return null for non-existent keys', async () => {
      const storage = new WidgetStorage('test');
      const result = await storage.load('nonexistent');

      expect(result).toBeNull();
    });

    it('should handle complex data structures', async () => {
      const storage = new WidgetStorage('test');
      const complexData = {
        nested: {
          array: [1, 2, 3],
          object: { key: 'value' },
        },
        date: new Date().toISOString(),
      };

      await storage.save('complex', complexData);
      const loaded = await storage.load('complex');

      expect(loaded).toEqual(complexData);
    });
  });

  describe('TTL (Time To Live)', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should respect TTL and return null for expired data', async () => {
      const storage = new WidgetStorage('test');
      const data = { value: 'test' };

      // Save with 60 second TTL
      await storage.save('temp', data, { ttl: 60 });

      // Should load immediately
      let loaded = await storage.load('temp');
      expect(loaded).toEqual(data);

      // Advance time by 61 seconds
      jest.advanceTimersByTime(61000);

      // Should return null as data is expired
      loaded = await storage.load('temp');
      expect(loaded).toBeNull();

      // Data should be removed
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@brik_widget_test_temp');
    });

    it('should not expire data without TTL', async () => {
      const storage = new WidgetStorage('test');
      const data = { value: 'persistent' };

      await storage.save('persistent', data);

      // Advance time significantly
      jest.advanceTimersByTime(1000000);

      const loaded = await storage.load('persistent');
      expect(loaded).toEqual(data);
    });
  });

  describe('remove', () => {
    it('should remove widget data', async () => {
      const storage = new WidgetStorage('test');

      await storage.save('toRemove', { value: 'test' });
      await storage.remove('toRemove');

      const loaded = await storage.load('toRemove');
      expect(loaded).toBeNull();
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@brik_widget_test_toRemove');
    });

    it('should handle removing non-existent keys gracefully', async () => {
      const storage = new WidgetStorage('test');
      await expect(storage.remove('nonexistent')).resolves.not.toThrow();
    });
  });

  describe('clear', () => {
    it('should clear all widget data in namespace', async () => {
      const storage = new WidgetStorage('test');

      await storage.save('key1', { value: 1 });
      await storage.save('key2', { value: 2 });
      await storage.save('key3', { value: 3 });

      await storage.clear();

      expect(AsyncStorage.multiRemove).toHaveBeenCalled();

      const loaded1 = await storage.load('key1');
      const loaded2 = await storage.load('key2');
      const loaded3 = await storage.load('key3');

      expect(loaded1).toBeNull();
      expect(loaded2).toBeNull();
      expect(loaded3).toBeNull();
    });

    it('should only clear data in its own namespace', async () => {
      const storage1 = new WidgetStorage('namespace1');
      const storage2 = new WidgetStorage('namespace2');

      await storage1.save('key', { value: 'ns1' });
      await storage2.save('key', { value: 'ns2' });

      await storage1.clear();

      const loaded1 = await storage1.load('key');
      const loaded2 = await storage2.load('key');

      expect(loaded1).toBeNull();
      expect(loaded2).toEqual({ value: 'ns2' });
    });
  });

  describe('getAllKeys', () => {
    it('should return all keys in namespace', async () => {
      const storage = new WidgetStorage('test');

      await storage.save('key1', { value: 1 });
      await storage.save('key2', { value: 2 });
      await storage.save('key3', { value: 3 });

      const keys = await storage.getAllKeys();

      expect(keys).toHaveLength(3);
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
      expect(keys).toContain('key3');
    });

    it('should only return keys from its namespace', async () => {
      const storage1 = new WidgetStorage('ns1');
      const storage2 = new WidgetStorage('ns2');

      await storage1.save('key1', { value: 1 });
      await storage2.save('key2', { value: 2 });

      const keys1 = await storage1.getAllKeys();
      const keys2 = await storage2.getAllKeys();

      expect(keys1).toEqual(['key1']);
      expect(keys2).toEqual(['key2']);
    });
  });

  describe('exists', () => {
    it('should return true for existing non-expired data', async () => {
      const storage = new WidgetStorage('test');

      await storage.save('existing', { value: 'test' });

      const exists = await storage.exists('existing');
      expect(exists).toBe(true);
    });

    it('should return false for non-existent data', async () => {
      const storage = new WidgetStorage('test');

      const exists = await storage.exists('nonexistent');
      expect(exists).toBe(false);
    });

    it('should return false for expired data', async () => {
      jest.useFakeTimers();
      const storage = new WidgetStorage('test');

      await storage.save('expired', { value: 'test' }, { ttl: 60 });

      jest.advanceTimersByTime(61000);

      const exists = await storage.exists('expired');
      expect(exists).toBe(false);

      jest.useRealTimers();
    });
  });

  describe('error handling', () => {
    it('should handle save errors gracefully', async () => {
      const storage = new WidgetStorage('test');
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(
        new Error('Storage full')
      );

      await expect(storage.save('key', { value: 'test' })).rejects.toThrow();

      consoleErrorSpy.mockRestore();
    });

    it('should handle load errors gracefully', async () => {
      const storage = new WidgetStorage('test');
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(
        new Error('Read error')
      );

      const result = await storage.load('key');
      expect(result).toBeNull();

      consoleErrorSpy.mockRestore();
    });
  });
});

describe('WidgetCache', () => {
  describe('set and get', () => {
    it('should cache data with TTL', () => {
      jest.useFakeTimers();
      const cache = new WidgetCache<{ value: number }>();

      cache.set('key', { value: 42 }, 300);

      const result = cache.get('key');
      expect(result).toEqual({ value: 42 });

      jest.useRealTimers();
    });

    it('should return null for non-existent keys', () => {
      const cache = new WidgetCache();

      const result = cache.get('nonexistent');
      expect(result).toBeNull();
    });

    it('should expire data after TTL', () => {
      jest.useFakeTimers();
      const cache = new WidgetCache();

      cache.set('key', { value: 'test' }, 60);

      // Should be available immediately
      expect(cache.get('key')).toEqual({ value: 'test' });

      // Advance time past TTL
      jest.advanceTimersByTime(61000);

      // Should be expired
      expect(cache.get('key')).toBeNull();

      jest.useRealTimers();
    });

    it('should use default TTL of 300 seconds', () => {
      jest.useFakeTimers();
      const cache = new WidgetCache();

      cache.set('key', { value: 'test' });

      // Should be available before 300 seconds
      jest.advanceTimersByTime(299000);
      expect(cache.get('key')).toEqual({ value: 'test' });

      // Should expire after 300 seconds
      jest.advanceTimersByTime(2000);
      expect(cache.get('key')).toBeNull();

      jest.useRealTimers();
    });
  });

  describe('has', () => {
    it('should return true for cached data', () => {
      const cache = new WidgetCache();

      cache.set('key', { value: 'test' });

      expect(cache.has('key')).toBe(true);
    });

    it('should return false for non-existent keys', () => {
      const cache = new WidgetCache();

      expect(cache.has('nonexistent')).toBe(false);
    });

    it('should return false for expired data', () => {
      jest.useFakeTimers();
      const cache = new WidgetCache();

      cache.set('key', { value: 'test' }, 60);

      jest.advanceTimersByTime(61000);

      expect(cache.has('key')).toBe(false);

      jest.useRealTimers();
    });
  });

  describe('invalidate', () => {
    it('should invalidate cached data', () => {
      const cache = new WidgetCache();

      cache.set('key', { value: 'test' });
      expect(cache.has('key')).toBe(true);

      cache.invalidate('key');
      expect(cache.has('key')).toBe(false);
    });

    it('should handle invalidating non-existent keys', () => {
      const cache = new WidgetCache();

      expect(() => cache.invalidate('nonexistent')).not.toThrow();
    });
  });

  describe('clear', () => {
    it('should clear all cached data', () => {
      const cache = new WidgetCache();

      cache.set('key1', { value: 1 });
      cache.set('key2', { value: 2 });
      cache.set('key3', { value: 3 });

      cache.clear();

      expect(cache.has('key1')).toBe(false);
      expect(cache.has('key2')).toBe(false);
      expect(cache.has('key3')).toBe(false);
    });
  });

  describe('getOrFetch', () => {
    it('should return cached data if available', async () => {
      const cache = new WidgetCache();
      const fetchFn = jest.fn().mockResolvedValue({ value: 'fetched' });

      cache.set('key', { value: 'cached' });

      const result = await cache.getOrFetch('key', fetchFn);

      expect(result).toEqual({ value: 'cached' });
      expect(fetchFn).not.toHaveBeenCalled();
    });

    it('should fetch and cache data if not available', async () => {
      const cache = new WidgetCache();
      const fetchFn = jest.fn().mockResolvedValue({ value: 'fetched' });

      const result = await cache.getOrFetch('key', fetchFn, 300);

      expect(result).toEqual({ value: 'fetched' });
      expect(fetchFn).toHaveBeenCalled();
      expect(cache.get('key')).toEqual({ value: 'fetched' });
    });

    it('should fetch data if cache is expired', async () => {
      jest.useFakeTimers();
      const cache = new WidgetCache();
      const fetchFn = jest.fn().mockResolvedValue({ value: 'refetched' });

      cache.set('key', { value: 'old' }, 60);

      jest.advanceTimersByTime(61000);

      const result = await cache.getOrFetch('key', fetchFn);

      expect(result).toEqual({ value: 'refetched' });
      expect(fetchFn).toHaveBeenCalled();

      jest.useRealTimers();
    });
  });
});

describe('Singleton instances', () => {
  it('should export default widgetStorage instance', () => {
    expect(widgetStorage).toBeInstanceOf(WidgetStorage);
  });

  it('should export default widgetCache instance', () => {
    expect(widgetCache).toBeInstanceOf(WidgetCache);
  });
});
