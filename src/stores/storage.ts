import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { StateStorage } from 'zustand/middleware';

/**
 * Expo Router renders web routes in Node, where AsyncStorage's `window`-backed
 * implementation does not exist. React Native always defines `window`, so this
 * only ever matches a server render.
 */
const isServerRender = Platform.OS === 'web' && typeof window === 'undefined';

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

export const asyncStorage: StateStorage = isServerRender ? createMemoryStorage() : AsyncStorage;

/**
 * Access tokens must not sit in AsyncStorage, so the session is kept in the
 * keychain / keystore. SecureStore has no web implementation, so web falls back
 * to AsyncStorage — another reason to move the token exchange to a server
 * before shipping a web build.
 */
export const secureStorage: StateStorage = isServerRender
  ? createMemoryStorage()
  : Platform.OS === 'web'
    ? AsyncStorage
    : {
        getItem: (key) => SecureStore.getItemAsync(key),
        setItem: (key, value) => SecureStore.setItemAsync(key, value),
        removeItem: (key) => SecureStore.deleteItemAsync(key),
      };
