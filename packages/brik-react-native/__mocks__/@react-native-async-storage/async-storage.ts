/**
 * Mock implementation of AsyncStorage for testing
 */

const storage: Map<string, string> = new Map();

const AsyncStorage = {
  setItem: jest.fn(async (key: string, value: string): Promise<void> => {
    storage.set(key, value);
  }),

  getItem: jest.fn(async (key: string): Promise<string | null> => {
    return storage.get(key) || null;
  }),

  removeItem: jest.fn(async (key: string): Promise<void> => {
    storage.delete(key);
  }),

  getAllKeys: jest.fn(async (): Promise<string[]> => {
    return Array.from(storage.keys());
  }),

  multiRemove: jest.fn(async (keys: string[]): Promise<void> => {
    keys.forEach((key) => storage.delete(key));
  }),

  clear: jest.fn(async (): Promise<void> => {
    storage.clear();
  }),

  // Test helper to reset storage
  __reset: () => {
    storage.clear();
    jest.clearAllMocks();
  },
};

export default AsyncStorage;
