import * as WebBrowser from 'expo-web-browser';

/**
 * Opens a Spotify web URL. Deep linking straight into the Spotify app is a
 * later step; it needs the app's URI scheme allow-listed on iOS.
 */
export function openSpotifyLink(url: string) {
  void WebBrowser.openBrowserAsync(url).catch(() => {
    // Nothing to recover from — the user just stays in the app.
  });
}
