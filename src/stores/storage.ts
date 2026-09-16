import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { StateStorage } from 'zustand/middleware';

function createMemoryStorage(): StateStorage {
  const entries = new Map<string, string>();

  return {
    getItem: (key) => entries.get(key) ?? null,
    setItem: (key, value) => {
      entries.set(key, value);
    },
    removeItem: (key) => {
      entries.delete(key);
    },
  };
}

/**
 * Expo Router SSR runs this module in Node. Detecting that at import time is
 * unreliable (React Native may define `window` as a stub), so each call falls
 * back to memory if the real backend is not actually usable.
 */
function createGuardedStorage(getStorage: () => StateStorage): StateStorage {
  const memory = createMemoryStorage();

  const resolve = (): StateStorage => {
    if (typeof globalThis.window === 'undefined') {
      return memory;
    }

    return getStorage();
  };

  return {
    getItem: (key) => {
      try {
        return resolve().getItem(key);
      } catch {
        return memory.getItem(key);
      }
    },
    setItem: (key, value) => {
      try {
        return resolve().setItem(key, value);
      } catch {
        return memory.setItem(key, value);
      }
    },
    removeItem: (key) => {
      try {
        return resolve().removeItem(key);
      } catch {
        return memory.removeItem(key);
      }
    },
  };
}

export const asyncStorage: StateStorage = createGuardedStorage(() => AsyncStorage);

/**
 * Access tokens must not sit in AsyncStorage, so the session is kept in the
 * keychain / keystore. SecureStore has no web implementation, so web falls back
 * to AsyncStorage — another reason to move the token exchange to a server
 * before shipping a web build.
 */
export const secureStorage: StateStorage = createGuardedStorage(() =>
  Platform.OS === 'web'
    ? AsyncStorage
    : {
        getItem: (key) => SecureStore.getItemAsync(key),
        setItem: (key, value) => SecureStore.setItemAsync(key, value),
        removeItem: (key) => SecureStore.deleteItemAsync(key),
      }
);
