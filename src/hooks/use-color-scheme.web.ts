/**
 * The app is dark-first. Returning a constant keeps the server render, the
 * hydrating client, and later updates on the same scheme — no light flash.
 */
export function useColorScheme() {
  return 'dark' as const;
}
