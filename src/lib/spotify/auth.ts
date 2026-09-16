import {
  exchangeCodeAsync,
  makeRedirectUri,
  refreshAsync,
  useAuthRequest,
} from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useState } from 'react';

import { useSessionStore, type SpotifyTokens } from '@/stores/session-store';

import { SPOTIFY_CLIENT_ID, SPOTIFY_DISCOVERY, SPOTIFY_SCOPES } from './config';

// Required to close the popup window on web.
WebBrowser.maybeCompleteAuthSession();

/**
 * Must be added verbatim to the Redirect URIs list in the Spotify developer
 * dashboard. Expo Go produces an `exp://` URI that Spotify rejects, so a
 * development build is needed to test the real flow.
 */
export function getSpotifyRedirectUri() {
  return makeRedirectUri({ scheme: 'vibe', path: 'spotify-auth' });
}

function toTokens(response: {
  accessToken: string;
  refreshToken?: string | null;
  expiresIn?: number | null;
}): SpotifyTokens {
  return {
    accessToken: response.accessToken,
    refreshToken: response.refreshToken ?? null,
    expiresAt: response.expiresIn ? Date.now() + response.expiresIn * 1000 : null,
  };
}

/**
 * Drives the real PKCE flow. Only mounted when a client id is configured, so
 * the demo path never pays for it.
 */
export function useSpotifyAuth() {
  const signInWithSpotify = useSessionStore((state) => state.signInWithSpotify);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [request, , promptAsync] = useAuthRequest(
    {
      clientId: SPOTIFY_CLIENT_ID,
      scopes: SPOTIFY_SCOPES,
      usePKCE: true,
      redirectUri: getSpotifyRedirectUri(),
    },
    SPOTIFY_DISCOVERY
  );

  const connect = useCallback(async () => {
    if (!request) return;

    setPending(true);
    setError(null);

    try {
      const result = await promptAsync();

      if (result.type === 'dismiss' || result.type === 'cancel') return;

      if (result.type !== 'success') {
        setError(result.type === 'error' ? result.error?.message ?? 'Spotify rejected the login' : 'Login failed');
        return;
      }

      const tokenResponse = await exchangeCodeAsync(
        {
          clientId: SPOTIFY_CLIENT_ID,
          code: result.params.code,
          redirectUri: getSpotifyRedirectUri(),
          extraParams: { code_verifier: request.codeVerifier ?? '' },
        },
        SPOTIFY_DISCOVERY
      );

      signInWithSpotify(toTokens(tokenResponse));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not reach Spotify');
    } finally {
      setPending(false);
    }
  }, [promptAsync, request, signInWithSpotify]);

  return { connect, pending, error, ready: Boolean(request) };
}

/**
 * Returns a non-expired access token, refreshing first if needed. Returns null
 * in demo mode, which is how the API layer decides to fall back to seed data.
 */
export async function getValidAccessToken() {
  const { tokens, setTokens, signOut } = useSessionStore.getState();

  if (!tokens) return null;

  const stillValid = !tokens.expiresAt || tokens.expiresAt - Date.now() > 60_000;
  if (stillValid) return tokens.accessToken;

  if (!tokens.refreshToken) {
    signOut();
    return null;
  }

  try {
    const refreshed = await refreshAsync(
      { clientId: SPOTIFY_CLIENT_ID, refreshToken: tokens.refreshToken },
      SPOTIFY_DISCOVERY
    );

    // Spotify rotates refresh tokens, so keep whichever one came back.
    const next = toTokens({
      accessToken: refreshed.accessToken,
      refreshToken: refreshed.refreshToken ?? tokens.refreshToken,
      expiresIn: refreshed.expiresIn,
    });

    setTokens(next);

    return next.accessToken;
  } catch {
    signOut();
    return null;
  }
}
