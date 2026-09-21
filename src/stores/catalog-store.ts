import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';

import { mockPlaylists, mockTracks } from '@/lib/mock-data';
import type { Playlist, Track } from '@/types';

import { asyncStorage } from './storage';

/**
 * Cache of music metadata. Seeded from mock data and topped up by the Spotify
 * layer, so the UI always reads tracks and playlists from one place regardless
 * of where they came from.
 */
type CatalogState = {
  tracks: Record<string, Track>;
  playlists: Record<string, Playlist>;

  upsertTracks: (tracks: Track[]) => void;
  upsertPlaylists: (playlists: Playlist[]) => void;
};

function byId<T extends { id: string }>(items: T[]) {
  return Object.fromEntries(items.map((item) => [item.id, item]));
}

function mergeByArtwork<T extends { artworkUrl: string }>(
  seed: Record<string, T>,
  extra?: Record<string, T>
): Record<string, T> {
  const out = { ...seed };
  if (!extra) return out;

  for (const [id, item] of Object.entries(extra)) {
    const existing = out[id];
    if (!existing) {
      out[id] = item;
      continue;
    }

    out[id] = {
      ...existing,
      ...item,
      artworkUrl: item.artworkUrl || existing.artworkUrl,
    };
  }

  return out;
}

function mergeTracks(seed: Record<string, Track>, extra?: Record<string, Track>): Record<string, Track> {
  const out = { ...seed };
  if (!extra) return out;

  for (const [id, item] of Object.entries(extra)) {
    const existing = out[id];
    if (!existing) {
      out[id] = { ...item, previewUrl: item.previewUrl ?? '' };
      continue;
    }

    out[id] = {
      ...existing,
      ...item,
      artworkUrl: item.artworkUrl || existing.artworkUrl,
      previewUrl: item.previewUrl || existing.previewUrl || '',
    };
  }

  return out;
}

export const useCatalogStore = create<CatalogState>()(
  persist(
    (set) => ({
      tracks: byId(mockTracks),
      playlists: byId(mockPlaylists),

      upsertTracks: (tracks) =>
        set((state) => ({ tracks: { ...state.tracks, ...byId(tracks) } })),

      upsertPlaylists: (playlists) =>
        set((state) => ({ playlists: { ...state.playlists, ...byId(playlists) } })),
    }),
    {
      name: 'vibe-catalog',
      storage: createJSONStorage(() => asyncStorage),
      partialize: ({ tracks, playlists }) => ({ tracks, playlists }),
      merge: (persisted, current) => {
        const extra = (persisted ?? {}) as Partial<CatalogState>;
        return {
          ...current,
          tracks: mergeTracks(current.tracks, extra.tracks),
          playlists: mergeByArtwork(current.playlists, extra.playlists),
        };
      },
    }
  )
);

export function useTrack(trackId: string | null | undefined) {
  return useCatalogStore((state) => (trackId ? state.tracks[trackId] : undefined));
}

export function usePlaylist(playlistId: string | null | undefined) {
  return useCatalogStore((state) => (playlistId ? state.playlists[playlistId] : undefined));
}

export function useTracks(trackIds: string[]) {
  return useCatalogStore(
    useShallow((state) =>
      trackIds.map((id) => state.tracks[id]).filter((track): track is Track => Boolean(track))
    )
  );
}

export function usePlaylists(playlistIds: string[]) {
  return useCatalogStore(
    useShallow((state) =>
      playlistIds
        .map((id) => state.playlists[id])
        .filter((playlist): playlist is Playlist => Boolean(playlist))
    )
  );
}

export function useSearchTracks(query: string) {
  const normalized = query.trim().toLowerCase();

  return useCatalogStore(
    useShallow((state) => {
      const all = Object.values(state.tracks);

      if (!normalized) return all.slice(0, 8);

      return all.filter(
        (track) =>
          track.name.toLowerCase().includes(normalized) ||
          track.artist.toLowerCase().includes(normalized)
      );
    })
  );
}
