import type { Playlist, Track } from '@/types';

import { getValidAccessToken } from './auth';
import { SPOTIFY_API_BASE } from './config';

type SpotifyImage = { url: string };

type SpotifyTrack = {
  id: string;
  name: string;
  duration_ms: number;
  album: { name: string; images: SpotifyImage[] };
  artists: { name: string }[];
  external_urls: { spotify: string };
};

type SpotifyPlaylist = {
  id: string;
  name: string;
  description: string | null;
  images: SpotifyImage[] | null;
  tracks: { total: number };
  owner: { display_name: string | null };
  external_urls: { spotify: string };
};

type SpotifyProfile = {
  id: string;
  display_name: string | null;
  images: SpotifyImage[] | null;
};

async function request<T>(path: string): Promise<T | null> {
  const token = await getValidAccessToken();
  if (!token) return null;

  const response = await fetch(`${SPOTIFY_API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(`Spotify ${response.status} on ${path}`);
  }

  return (await response.json()) as T;
}

function toTrack(raw: SpotifyTrack): Track {
  return {
    id: raw.id,
    name: raw.name,
    artist: raw.artists.map((artist) => artist.name).join(', '),
    album: raw.album.name,
    durationMs: raw.duration_ms,
    artworkUrl: raw.album.images[0]?.url ?? '',
    spotifyUrl: raw.external_urls.spotify,
  };
}

function toPlaylist(raw: SpotifyPlaylist): Playlist {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description ?? '',
    trackCount: raw.tracks.total,
    ownerName: raw.owner.display_name ?? '',
    artworkUrl: raw.images?.[0]?.url ?? '',
    spotifyUrl: raw.external_urls.spotify,
    trackIds: [],
  };
}

/** Each of these resolves to null when running on seed data. */
export async function fetchMyProfile() {
  const raw = await request<SpotifyProfile>('/me');
  if (!raw) return null;

  return {
    id: raw.id,
    displayName: raw.display_name ?? '',
    avatarUrl: raw.images?.[0]?.url ?? '',
  };
}

export async function fetchMyTopTracks() {
  const raw = await request<{ items: SpotifyTrack[] }>(
    '/me/top/tracks?limit=20&time_range=short_term'
  );

  return raw?.items.map(toTrack) ?? null;
}

export async function fetchMyPlaylists() {
  const raw = await request<{ items: SpotifyPlaylist[] }>('/me/playlists?limit=20');

  return raw?.items.map(toPlaylist) ?? null;
}

export async function searchTracks(query: string) {
  if (!query.trim()) return null;

  const raw = await request<{ tracks: { items: SpotifyTrack[] } }>(
    `/search?type=track&limit=20&q=${encodeURIComponent(query)}`
  );

  return raw?.tracks.items.map(toTrack) ?? null;
}
