/**
 * Seed data for the frontend MVP. Everything here is replaced by real Spotify +
 * backend data later; the stores treat it as the initial snapshot only.
 */

import type { Comment, Playlist, Post, Track, User } from '@/types';

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;

export const CURRENT_USER_ID = 'u_me';

function track(
  id: string,
  name: string,
  artist: string,
  album: string,
  durationMs: number
): Track {
  return {
    id,
    name,
    artist,
    album,
    durationMs,
    artworkUrl: '',
    spotifyUrl: `https://open.spotify.com/track/${id}`,
  };
}

export const mockTracks: Track[] = [
  track('t01', 'Midnight City', 'M83', 'Hurry Up, We’re Dreaming', 243_000),
  track('t02', 'Redbone', 'Childish Gambino', 'Awaken, My Love!', 326_000),
  track('t03', 'Nights', 'Frank Ocean', 'Blonde', 307_000),
  track('t04', 'Motion Sickness', 'Phoebe Bridgers', 'Stranger in the Alps', 243_000),
  track('t05', 'Weird Fishes / Arpeggi', 'Radiohead', 'In Rainbows', 318_000),
  track('t06', 'Time to Pretend', 'MGMT', 'Oracular Spectacular', 261_000),
  track('t07', 'Alright', 'Kendrick Lamar', 'To Pimp a Butterfly', 219_000),
  track('t08', 'Dreams', 'Fleetwood Mac', 'Rumours', 257_000),
  track('t09', 'Tek It', 'Cafuné', 'Running', 209_000),
  track('t10', 'Somebody Else', 'The 1975', 'I Like It When You Sleep', 347_000),
  track('t11', 'Sun Models', 'ODESZA', 'Summer’s Gone', 227_000),
  track('t12', 'Sincerity Is Scary', 'The 1975', 'A Brief Inquiry', 178_000),
  track('t13', 'Electric Feel', 'MGMT', 'Oracular Spectacular', 229_000),
  track('t14', 'Pink + White', 'Frank Ocean', 'Blonde', 184_000),
  track('t15', 'Kyoto', 'Phoebe Bridgers', 'Punisher', 184_000),
  track('t16', 'Lost in Yesterday', 'Tame Impala', 'The Slow Rush', 250_000),
];

function playlist(
  id: string,
  name: string,
  description: string,
  ownerName: string,
  trackIds: string[]
): Playlist {
  return {
    id,
    name,
    description,
    ownerName,
    trackIds,
    trackCount: trackIds.length * 7,
    artworkUrl: '',
    spotifyUrl: `https://open.spotify.com/playlist/${id}`,
  };
}

export const mockPlaylists: Playlist[] = [
  playlist('p01', 'late night drives', 'headlights and synths', 'you', [
    't01',
    't11',
    't16',
    't13',
  ]),
  playlist('p02', 'sad but danceable', 'crying in the club', 'nina', [
    't04',
    't10',
    't12',
    't15',
  ]),
  playlist('p03', 'sunday reset', 'slow coffee music', 'omar', ['t03', 't14', 't08', 't05']),
  playlist('p04', 'gym rage', 'no skips allowed', 'lea', ['t07', 't06', 't02', 't13']),
  playlist('p05', 'deep cuts 2010s', 'the ones that aged well', 'you', [
    't05',
    't06',
    't10',
    't01',
  ]),
];

export const mockUsers: User[] = [
  {
    id: CURRENT_USER_ID,
    handle: 'pepa',
    displayName: 'Pepa',
    avatarUrl: '',
    bio: 'certified playlist curator. ask me about the 2016 indie renaissance.',
    accentColor: '#1DB954',
    anthemTrackId: 't01',
    spotifyConnected: false,
    topTrackIds: ['t01', 't05', 't16', 't11', 't13'],
    playlistIds: ['p01', 'p05'],
  },
  {
    id: 'u_nina',
    handle: 'ninawav',
    displayName: 'Nina',
    avatarUrl: '',
    bio: 'sad girl autumn, all year round 🍂',
    accentColor: '#EC4899',
    anthemTrackId: 't15',
    spotifyConnected: true,
    topTrackIds: ['t04', 't15', 't10', 't12'],
    playlistIds: ['p02'],
  },
  {
    id: 'u_omar',
    handle: 'omarsounds',
    displayName: 'Omar',
    avatarUrl: '',
    bio: 'vinyl guy. yes I will talk about mastering.',
    accentColor: '#06B6D4',
    anthemTrackId: 't03',
    spotifyConnected: true,
    topTrackIds: ['t03', 't14', 't08', 't05'],
    playlistIds: ['p03'],
  },
  {
    id: 'u_lea',
    handle: 'leabpm',
    displayName: 'Lea',
    avatarUrl: '',
    bio: '180bpm or nothing',
    accentColor: '#F97316',
    anthemTrackId: 't07',
    spotifyConnected: true,
    topTrackIds: ['t07', 't02', 't06', 't13'],
    playlistIds: ['p04'],
  },
  {
    id: 'u_theo',
    handle: 'theolistens',
    displayName: 'Theo',
    avatarUrl: '',
    bio: 'I listen to everything (I listen to 4 artists)',
    accentColor: '#7C3AED',
    anthemTrackId: 't16',
    spotifyConnected: false,
    topTrackIds: ['t16', 't09', 't11', 't01'],
    playlistIds: [],
  },
];

/** Who the current user already follows at seed time. */
export const mockFollowing: string[] = ['u_nina', 'u_omar'];

/** Follower counts for other users, so profiles do not all read "0 followers". */
export const mockFollowerCounts: Record<string, number> = {
  u_me: 128,
  u_nina: 2410,
  u_omar: 874,
  u_lea: 1596,
  u_theo: 63,
};

const now = Date.now();

export const mockPosts: Post[] = [
  {
    id: 'po1',
    authorId: 'u_nina',
    caption: 'this bridge rearranged my brain chemistry',
    subject: { kind: 'track', trackId: 't15' },
    createdAt: now - 40 * MINUTE,
    likedBy: ['u_omar', 'u_theo', CURRENT_USER_ID],
  },
  {
    id: 'po2',
    authorId: 'u_omar',
    caption: 'sunday reset is updated, 4 new songs in there',
    subject: { kind: 'playlist', playlistId: 'p03' },
    createdAt: now - 3 * HOUR,
    likedBy: ['u_nina'],
  },
  {
    id: 'po3',
    authorId: 'u_lea',
    caption: 'if this doesn’t make you run faster nothing will',
    subject: { kind: 'track', trackId: 't07' },
    createdAt: now - 7 * HOUR,
    likedBy: ['u_theo', 'u_omar', 'u_nina'],
  },
  {
    id: 'po4',
    authorId: CURRENT_USER_ID,
    caption: 'still the best intro of all time, no notes',
    subject: { kind: 'track', trackId: 't01' },
    createdAt: now - 26 * HOUR,
    likedBy: ['u_nina', 'u_omar', 'u_lea', 'u_theo'],
  },
  {
    id: 'po5',
    authorId: 'u_theo',
    caption: 'found this at 2am and haven’t stopped',
    subject: { kind: 'track', trackId: 't09' },
    createdAt: now - 2 * 24 * HOUR,
    likedBy: [],
  },
  {
    id: 'po6',
    authorId: 'u_nina',
    caption: 'made a playlist for the feeling of leaving a party early',
    subject: { kind: 'playlist', playlistId: 'p02' },
    createdAt: now - 3 * 24 * HOUR,
    likedBy: [CURRENT_USER_ID, 'u_lea'],
  },
];

export const mockComments: Comment[] = [
  {
    id: 'c1',
    postId: 'po1',
    authorId: 'u_omar',
    body: 'the drums at 2:10 are insane',
    createdAt: now - 30 * MINUTE,
  },
  {
    id: 'c2',
    postId: 'po1',
    authorId: CURRENT_USER_ID,
    body: 'adding this to late night drives immediately',
    createdAt: now - 12 * MINUTE,
  },
  {
    id: 'c3',
    postId: 'po2',
    authorId: 'u_lea',
    body: 'omar never misses',
    createdAt: now - 2 * HOUR,
  },
  {
    id: 'c4',
    postId: 'po3',
    authorId: 'u_theo',
    body: 'ok but this is a cooldown song for me',
    createdAt: now - 6 * HOUR,
  },
  {
    id: 'c5',
    postId: 'po4',
    authorId: 'u_nina',
    body: 'correct take',
    createdAt: now - 20 * HOUR,
  },
];
