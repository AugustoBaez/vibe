/**
 * Expo Router treats every incoming URL as a route. The development build
 * launches via `vibe://expo-development-client/?url=…`, which is not a screen.
 * `/` is the signed-in feed, so send cold starts to `/connect` — if a session
 * already exists, the protected stack bounces them into the tabs.
 */
export function redirectSystemPath({ path }: { path: string; initial: boolean }) {
  try {
    if (path.includes('expo-development-client')) {
      return '/connect';
    }

    return path;
  } catch {
    return '/connect';
  }
}
