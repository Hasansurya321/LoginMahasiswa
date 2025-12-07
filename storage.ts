// storage.ts - Persistent storage using MMKV with fallback to memory
import type { MMKV } from 'react-native-mmkv';

export type StoredUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
};

/**
 * Interface for storage operations
 * Provides abstraction layer for both MMKV and memory storage
 */
interface StorageInterface {
  set: (key: string, value: string) => void;
  getString: (key: string) => string | undefined;
  delete: (key: string) => void;
  getAllKeys: () => string[];
  clearAll: () => void;
}

// Global storage instance
let storageInstance: StorageInterface;

/**
 * Initialize storage with MMKV native module
 * Falls back to in-memory storage if native module is not linked
 */
function initializeStorage(): StorageInterface {
  try {
    // Try to initialize MMKV native module
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { MMKV: MMKVConstructor } = require('react-native-mmkv');
    const mmkv = new MMKVConstructor();
    
    console.log('✓ MMKV storage initialized successfully');
    
    return {
      set: (key: string, value: string) => mmkv.set(key, value),
      getString: (key: string) => mmkv.getString(key),
      delete: (key: string) => mmkv.delete(key),
      getAllKeys: () => mmkv.getAllKeys() || [],
      clearAll: () => mmkv.clearAll(),
    } as StorageInterface;
  } catch (error) {
    // Fallback to in-memory storage if native module is not available
    console.warn(
      '⚠ MMKV initialization failed, using memory fallback. This is normal during development.',
      error instanceof Error ? error.message : error
    );
    
    const memory: Record<string, string> = {};
    
    return {
      set: (key: string, value: string) => {
        memory[key] = value;
      },
      getString: (key: string) => memory[key],
      delete: (key: string) => {
        delete memory[key];
      },
      getAllKeys: () => Object.keys(memory),
      clearAll: () => {
        Object.keys(memory).forEach(key => delete memory[key]);
      },
    };
  }
}

// Initialize storage immediately on module load
storageInstance = initializeStorage();

export const storage = storageInstance;

/**
 * Save user login information to persistent storage
 * Clears all previous data before saving new login (to ensure clean state per user)
 */
export function setLoginInfo(user: { uid: string; email: string | null; displayName?: string | null }): void {
  try {
    // Clear all existing data before saving new login
    storageInstance.clearAll();
    console.log('✓ Storage cleared before new login');
    
    const payload: StoredUser = {
      uid: user.uid,
      email: user.email ?? null,
      displayName: user.displayName ?? null,
    };
    storageInstance.set('user', JSON.stringify(payload));
    console.log('✓ Login info saved successfully:', { uid: user.uid, email: user.email });
  } catch (error) {
    console.error('Failed to save login info:', error instanceof Error ? error.message : error);
  }
}

/**
 * Retrieve user login information from persistent storage
 */
export function getLoginInfo(): StoredUser | null {
  try {
    const json = storageInstance.getString('user');
    if (!json) {
      return null;
    }
    return JSON.parse(json) as StoredUser;
  } catch (error) {
    console.error('Failed to retrieve login info:', error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * Clear user login information from persistent storage
 */
export function clearLoginInfo(): void {
  try {
    storageInstance.delete('user');
    console.log('✓ Login info cleared successfully');
  } catch (error) {
    console.error('Failed to clear login info:', error instanceof Error ? error.message : error);
  }
}
