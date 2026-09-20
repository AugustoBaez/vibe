import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { CURRENT_USER_ID } from '@/lib/mock-data';

import { secureStorage } from './storage';

export type SpotifyTokens = {
  accessToken: string;
  refreshToken: string | null;
  /** Epoch ms, or null when the provider did not return an expiry. */
  expiresAt: number | null;
};

export type PendingPkce = {
  codeVerifier: string;
  redirectUri: string;
};

type SessionState = {
  currentUserId: string | null;
  tokens: SpotifyTokens | null;
  /** Signed in against the seed data instead of a real Spotify app. */
  demoMode: boolean;
  hydrated: boolean;
  /** PKCE verifier kept across the Android activity hop back from Spotify. */
  pendingPkce: PendingPkce | null;

  signInWithSpotify: (tokens: SpotifyTokens, userId?: string) => void;
  signInAsDemo: () => void;
  setTokens: (tokens: SpotifyTokens) => void;
  setPendingPkce: (pendingPkce: PendingPkce | null) => void;
  signOut: () => void;
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      currentUserId: null,
      tokens: null,
      demoMode: false,
      hydrated: false,
      pendingPkce: null,

      signInWithSpotify: (tokens, userId = CURRENT_USER_ID) =>
        set({ currentUserId: userId, tokens, demoMode: false, pendingPkce: null }),

      signInAsDemo: () => set({ currentUserId: CURRENT_USER_ID, tokens: null, demoMode: true }),

      setTokens: (tokens) => set({ tokens }),

      setPendingPkce: (pendingPkce) => set({ pendingPkce }),

      signOut: () => set({ currentUserId: null, tokens: null, demoMode: false, pendingPkce: null }),
    }),
    {
      name: 'vibe-session',
      version: 1,
      storage: createJSONStorage(() => secureStorage),
      partialize: ({ currentUserId, tokens, demoMode, pendingPkce }) => ({
        currentUserId,
        tokens,
        demoMode,
        pendingPkce,
      }),
      onRehydrateStorage: () => () => {
        useSessionStore.setState({ hydrated: true });
      },
    }
  )
);

setTimeout(() => {
  if (!useSessionStore.getState().hydrated) {
    useSessionStore.setState({ hydrated: true });
  }
}, 1500);

export function useIsSignedIn() {
  return useSessionStore((state) => state.currentUserId !== null);
}

export function useSessionHydrated() {
  return useSessionStore((state) => state.hydrated);
}

/**
 * The signed-in user's id. Screens behind the auth guard can rely on this being
 * set; the fallback keeps types simple for the few places rendered during
 * sign-out transitions.
 */
export function useCurrentUserId() {
  return useSessionStore((state) => state.currentUserId) ?? CURRENT_USER_ID;
}

export function useIsDemoMode() {
  return useSessionStore((state) => state.demoMode);
}

/** Read the access token outside of React (used by the Spotify fetch layer). */
export function getAccessToken() {
  return useSessionStore.getState().tokens?.accessToken ?? null;
}
