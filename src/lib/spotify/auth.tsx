import Constants from 'expo-constants';
import {
  exchangeCodeAsync,
  refreshAsync,
  useAuthRequest,
} from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { Platform } from 'react-native';

import { useSessionStore, type SpotifyTokens } from '@/stores/session-store';

import { SPOTIFY_CLIENT_ID, SPOTIFY_DISCOVERY, SPOTIFY_SCOPES } from './config';

// Required to close the popup window on web.
WebBrowser.maybeCompleteAuthSession();

/** Custom scheme for a native development / production build. */
export const SPOTIFY_NATIVE_REDIRECT_URI = 'vibe://spotify-auth';

export const isExpoGo = Constants.appOwnership === 'expo';

function webOrigin() {
  if (typeof window === 'undefined') {
    return 'http://127.0.0.1:8083';
  }

  const { protocol, hostname, port } = window.location;
  const host = hostname === 'localhost' ? '127.0.0.1' : hostname;
  const suffix = port ? `:${port}` : '';

  return `${protocol}//${host}${suffix}`;
}

/**
 * The exact string sent to Spotify. Add this verbatim under Redirect URIs in
 * the developer dashboard — localhost vs 127.0.0.1, and a missing path, both
 * count as a mismatch.
 */
export function getSpotifyRedirectUri() {
  if (Platform.OS === 'web') {
    return `${webOrigin()}/spotify-auth`;
  }

  return SPOTIFY_NATIVE_REDIRECT_URI;
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
  const setPendingPkce = useSessionStore((state) => state.setPendingPkce);
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

    const redirectUri = getSpotifyRedirectUri();
    if (request.codeVerifier) {
      setPendingPkce({ codeVerifier: request.codeVerifier, redirectUri });
    }

    try {
      const result = await promptAsync();

      if (result.type === 'dismiss' || result.type === 'cancel') return;

      if (result.type !== 'success') {
        setError(result.type === 'error' ? result.error?.message ?? 'Spotify rejected the login' : 'Login failed');
        return;
      }

      if (result.params.code) {
        await completeSpotifyLogin(result.params.code);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not reach Spotify');
    } finally {
      setPending(false);
    }
  }, [promptAsync, request, setPendingPkce]);

  return { connect, pending, error, ready: Boolean(request) };
}

let loginInFlight = false;

/** Finishes PKCE after Spotify returns `?code=` — including Android activity restarts. */
export async function completeSpotifyLogin(code: string) {
  const { tokens, demoMode, pendingPkce, signInWithSpotify } = useSessionStore.getState();

  if (tokens && !demoMode) return;
  if (loginInFlight) return;

  if (!pendingPkce?.codeVerifier) {
    throw new Error('Login session expired. Try Continue with Spotify again.');
  }

  loginInFlight = true;

  try {
    const tokenResponse = await exchangeCodeAsync(
      {
        clientId: SPOTIFY_CLIENT_ID,
        code,
        redirectUri: pendingPkce.redirectUri,
        extraParams: { code_verifier: pendingPkce.codeVerifier },
      },
      SPOTIFY_DISCOVERY
    );

    signInWithSpotify(toTokens(tokenResponse));
  } finally {
    loginInFlight = false;
  }
}

type SpotifyAuthValue = ReturnType<typeof useSpotifyAuth>;

const SpotifyAuthContext = createContext<SpotifyAuthValue | null>(null);

/**
 * Keeps the PKCE request mounted at the root. If it lived on the connect
 * screen, navigating to `spotify-auth` after login would unmount it and the
 * emulator would sit on a spinner forever.
 */
export function SpotifyAuthProvider({ children }: { children: ReactNode }) {
  if (!SPOTIFY_CLIENT_ID) return children;

  return <SpotifyAuthRuntime>{children}</SpotifyAuthRuntime>;
}

function SpotifyAuthRuntime({ children }: { children: ReactNode }) {
  const auth = useSpotifyAuth();

  return <SpotifyAuthContext.Provider value={auth}>{children}</SpotifyAuthContext.Provider>;
}

export function useSpotifyAuthContext() {
  const value = useContext(SpotifyAuthContext);

  if (!value) {
    return {
      connect: async () => {},
      pending: false,
      error: null as string | null,
      ready: false,
    };
  }

  return value;
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
