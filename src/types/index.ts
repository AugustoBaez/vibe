/**
 * Domain model for the app. These shapes are intentionally close to what the
 * Spotify Web API returns (see `src/lib/spotify/api.ts` for the mapping) so the
 * mock data can be swapped for live data without touching the UI.
 */

export type Track = {
  id: string;
  name: string;
  artist: string;
  album: string;
  durationMs: number;
  /** Album art URL. Empty string means "render a generated cover". */
  artworkUrl: string;
  spotifyUrl: string;
};

export type Playlist = {
  id: string;
  name: string;
  description: string;
  trackCount: number;
  ownerName: string;
  artworkUrl: string;
  spotifyUrl: string;
  /** Preview of the first few tracks, used on playlist cards. */
  trackIds: string[];
};

export type User = {
  id: string;
  handle: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  /** Profile customization: hex color used for accents on this user's profile. */
  accentColor: string;
  /** Profile customization: the track pinned to the top of the profile. */
  anthemTrackId: string | null;
  spotifyConnected: boolean;
  topTrackIds: string[];
  playlistIds: string[];
};

export type PostSubject =
  | { kind: 'track'; trackId: string }
  | { kind: 'playlist'; playlistId: string };

export type Post = {
  id: string;
  authorId: string;
  caption: string;
  subject: PostSubject;
  createdAt: number;
  /** User ids, so the current user's like state is derived rather than stored twice. */
  likedBy: string[];
};

export type Comment = {
  id: string;
  postId: string;
  authorId: string;
  body: string;
  createdAt: number;
};
