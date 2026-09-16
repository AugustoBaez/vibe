import { useSyncExternalStore } from 'react';
import type { ColorSchemeName } from 'react-native';

/**
 * To support static rendering, this value needs to be re-calculated on the
 * client side for web. `getServerSnapshot` keeps the server render and the
 * hydrating client render in agreement, and React swaps in the real value
 * immediately after.
 */
const DARK_QUERY = '(prefers-color-scheme: dark)';

function subscribe(onStoreChange: () => void) {
  const query = window.matchMedia(DARK_QUERY);
  query.addEventListener('change', onStoreChange);

  return () => query.removeEventListener('change', onStoreChange);
}

function getSnapshot(): ColorSchemeName {
  return window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light';
}

function getServerSnapshot(): ColorSchemeName {
  return 'light';
}

export function useColorScheme() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
