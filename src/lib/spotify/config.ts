/**
 * Spotify uses Authorization Code + PKCE for mobile apps, which needs no client
 * secret and therefore no server for the token exchange. Set
 * `EXPO_PUBLIC_SPOTIFY_CLIENT_ID` in `.env` to switch the app from seed data to
 * a real Spotify account.
 *
 * Two things still require a real backend:
 *  - the social graph (feed, likes, comments, follows), which Spotify has no API for
 *  - refresh-token storage, if you want sessions to survive a reinstall
 */

export const SPOTIFY_CLIENT_ID = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID ?? '';

export const SPOTIFY_ENABLED = SPOTIFY_CLIENT_ID.length > 0;

/** Spotify has no revocation endpoint, so it is omitted here. */
export const SPOTIFY_DISCOVERY = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
};

export const SPOTIFY_SCOPES = [
  'user-read-email',
  'user-read-private',
  'user-top-read',
  'user-read-recently-played',
  'playlist-read-private',
];

export const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';
