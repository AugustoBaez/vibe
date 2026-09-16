import { useEffect } from 'react';

import { useCatalogStore } from '@/stores/catalog-store';
import { useSessionStore } from '@/stores/session-store';
import { useUsersStore } from '@/stores/users-store';

import { fetchMyPlaylists, fetchMyProfile, fetchMyTopTracks } from './api';

/**
 * Pulls the signed-in user's Spotify library into the stores once a real token
 * exists. No-ops in demo mode, where the seed data is already loaded.
 */
export function useSpotifySync() {
  const accessToken = useSessionStore((state) => state.tokens?.accessToken ?? null);
  const currentUserId = useSessionStore((state) => state.currentUserId);

  useEffect(() => {
    if (!accessToken || !currentUserId) return;

    let cancelled = false;

    async function sync(userId: string) {
      const [profile, topTracks, playlists] = await Promise.all([
        fetchMyProfile(),
        fetchMyTopTracks(),
        fetchMyPlaylists(),
      ]);

      if (cancelled) return;

      const { upsertTracks, upsertPlaylists } = useCatalogStore.getState();
      const { updateProfile, markSpotifyConnected } = useUsersStore.getState();

      if (topTracks?.length) {
        upsertTracks(topTracks);
      }

      if (playlists?.length) {
        upsertPlaylists(playlists);
      }

      markSpotifyConnected(userId, true);

      updateProfile(userId, {
        ...(profile?.displayName ? { displayName: profile.displayName } : null),
        ...(profile?.avatarUrl ? { avatarUrl: profile.avatarUrl } : null),
      });

      useUsersStore.setState((state) => {
        const user = state.users[userId];
        if (!user) return state;

        return {
          users: {
            ...state.users,
            [userId]: {
              ...user,
              topTrackIds: topTracks?.map((track) => track.id) ?? user.topTrackIds,
              playlistIds: playlists?.map((playlist) => playlist.id) ?? user.playlistIds,
            },
          },
        };
      });
    }

    void sync(currentUserId).catch(() => {
      // A failed sync leaves the seeded data in place; nothing to surface yet.
    });

    return () => {
      cancelled = true;
    };
  }, [accessToken, currentUserId]);
}
