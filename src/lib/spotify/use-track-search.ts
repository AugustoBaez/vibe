import { useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { searchTracks } from '@/lib/spotify/api';
import { useCatalogStore, useSearchTracks } from '@/stores/catalog-store';
import { useSessionStore } from '@/stores/session-store';
import type { Track } from '@/types';

const DEBOUNCE_MS = 280;
const SPOTIFY_TRACK_ID = /^[A-Za-z0-9]{22}$/;

function isSpotifyTrackId(id: string) {
  return SPOTIFY_TRACK_ID.test(id);
}

/**
 * Live Spotify catalog search when a real token exists. Falls back to the
 * in-memory seed catalog in demo mode, or if the request fails.
 */
export function useTrackSearch(query: string) {
  const connected = useSessionStore(
    (state) => Boolean(state.tokens?.accessToken) && !state.demoMode
  );
  const localTracks = useSearchTracks(query);
  const libraryTracks = useCatalogStore(
    useShallow((state) =>
      Object.values(state.tracks)
        .filter((track) => isSpotifyTrackId(track.id) && track.artworkUrl)
        .slice(0, 12)
    )
  );

  const [remote, setRemote] = useState<Track[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!connected) {
      setRemote(null);
      setLoading(false);
      return;
    }

    const q = query.trim();
    if (!q) {
      setRemote(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setRemote(null);
    setLoading(true);

    const handle = setTimeout(() => {
      void searchTracks(q)
        .then((results) => {
          if (cancelled) return;

          if (results) {
            useCatalogStore.getState().upsertTracks(results);
            setRemote(results);
          } else {
            setRemote(null);
          }
        })
        .catch(() => {
          if (!cancelled) setRemote(null);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [connected, query]);

  const trimmed = query.trim();
  const tracks = !connected
    ? localTracks
    : trimmed
      ? loading
        ? []
        : (remote ?? localTracks)
      : libraryTracks.length
        ? libraryTracks
        : localTracks;

  return { tracks, loading: connected && Boolean(trimmed) && loading, connected };
}
