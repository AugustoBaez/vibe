import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';

import { mockPlaylists, mockTracks } from '@/lib/mock-data';
import type { Playlist, Track } from '@/types';

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

export const useCatalogStore = create<CatalogState>()((set) => ({
  tracks: byId(mockTracks),
  playlists: byId(mockPlaylists),

  upsertTracks: (tracks) =>
    set((state) => ({ tracks: { ...state.tracks, ...byId(tracks) } })),

  upsertPlaylists: (playlists) =>
    set((state) => ({ playlists: { ...state.playlists, ...byId(playlists) } })),
}));

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
