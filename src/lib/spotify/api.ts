import type { Playlist, Track } from '@/types';

import { getValidAccessToken } from './auth';
import { SPOTIFY_API_BASE } from './config';

type SpotifyImage = { url: string; width?: number | null; height?: number | null };

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

/** Prefer ~300px covers for rows; fall back to the largest image Spotify sent. */
function pickArtwork(images: SpotifyImage[] | null | undefined, preferred = 300) {
  if (!images?.length) return '';

  const scored = images
    .filter((image) => image.url)
    .map((image) => ({
      url: image.url,
      score: Math.abs((image.width ?? preferred) - preferred),
    }))
    .sort((a, b) => a.score - b.score);

  return scored[0]?.url ?? images[0]?.url ?? '';
}

function uniqueById<T extends { id: string }>(items: T[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function toTrack(raw: SpotifyTrack): Track {
  return {
    id: raw.id,
    name: raw.name,
    artist: raw.artists.map((artist) => artist.name).join(', '),
    album: raw.album.name,
    durationMs: raw.duration_ms,
    artworkUrl: pickArtwork(raw.album.images),
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
    artworkUrl: pickArtwork(raw.images),
    spotifyUrl: raw.external_urls.spotify,
    trackIds: [],
  };
}

function asTracks(items: (SpotifyTrack | null | undefined)[] | undefined) {
  return uniqueById(
    (items ?? [])
      .filter((item): item is SpotifyTrack => Boolean(item?.id))
      .map(toTrack)
  );
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
  const raw = await request<{ items: (SpotifyTrack | null)[] }>(
    '/me/top/tracks?limit=50&time_range=short_term'
  );

  return raw ? asTracks(raw.items) : null;
}

export async function fetchMyRecentlyPlayed() {
  const raw = await request<{ items: { track: SpotifyTrack | null }[] }>(
    '/me/player/recently-played?limit=50'
  );

  return raw ? asTracks(raw.items.map((item) => item.track)) : null;
}

export async function fetchMyPlaylists() {
  const raw = await request<{ items: SpotifyPlaylist[] }>('/me/playlists?limit=50');

  return raw?.items.map(toPlaylist) ?? null;
}

export async function searchTracks(query: string) {
  if (!query.trim()) return null;

  const raw = await request<{ tracks: { items: (SpotifyTrack | null)[] } }>(
    `/search?type=track&limit=30&q=${encodeURIComponent(query)}`
  );

  return raw ? asTracks(raw.tracks.items) : null;
}
