// storage.ts
import type { MMKV } from 'react-native-mmkv';

export type StoredUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
};

// Interface untuk storage
interface StorageInterface {
  set: (key: string, value: string) => void;
  getString: (key: string) => string | undefined;
  delete: (key: string) => void;
}

// Global storage instance
let storageInstance: StorageInterface;

// Initialize storage
function initializeStorage(): StorageInterface {
  try {
    // Coba init MMKV native - dynamic require karena MMKV adalah native module
    const { MMKV: MMKVConstructor } = require('react-native-mmkv');
    const mmkv = new MMKVConstructor();
    console.log('✓ MMKV storage initialized successfully');
    return mmkv as StorageInterface;
  } catch (error) {
    // Fallback ke memory jika native module belum ter-link
    console.warn('⚠ MMKV initialization failed, using memory fallback', error);
    const memory: Record<string, string> = {};
    return {
      set: (key: string, value: string) => {
        memory[key] = value;
      },
      getString: (key: string) => memory[key],
      delete: (key: string) => {
        delete memory[key];
      },
    };
  }
}

// Initialize storage immediately
storageInstance = initializeStorage();

export const storage = storageInstance;

// SIMPAN INFO LOGIN
export function setLoginInfo(user: { uid: string; email: string | null; displayName?: string | null }): void {
  try {
    const payload: StoredUser = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName ?? null,
    };
    storageInstance.set('user', JSON.stringify(payload));
  } catch (error) {
    console.error('Failed to save login info:', error);
  }
}

// AMBIL INFO LOGIN
export function getLoginInfo(): StoredUser | null {
  try {
    const json = storageInstance.getString('user');
    return json ? (JSON.parse(json) as StoredUser) : null;
  } catch (error) {
    console.error('Failed to retrieve login info:', error);
    return null;
  }
}

// HAPUS INFO LOGIN
export function clearLoginInfo(): void {
  try {
    storageInstance.delete('user');
  } catch (error) {
    console.error('Failed to clear login info:', error);
  }
}
