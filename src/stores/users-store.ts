import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';

import { CURRENT_USER_ID, mockFollowerCounts, mockFollowing, mockUsers } from '@/lib/mock-data';
import type { User } from '@/types';

import { asyncStorage } from './storage';

/** The subset of a profile the owner can edit. */
export type ProfileEdits = Pick<
  User,
  'displayName' | 'bio' | 'accentColor' | 'anthemTrackId' | 'avatarUrl'
>;

type UsersState = {
  users: Record<string, User>;
  /** Ids the current user follows. */
  following: string[];
  followerCounts: Record<string, number>;

  updateProfile: (userId: string, edits: Partial<ProfileEdits>) => void;
  toggleFollow: (userId: string) => void;
  upsertUsers: (users: User[]) => void;
  markSpotifyConnected: (userId: string, connected: boolean) => void;
};

const seedUsers = Object.fromEntries(mockUsers.map((user) => [user.id, user]));

export const useUsersStore = create<UsersState>()(
  persist(
    (set) => ({
      users: seedUsers,
      following: mockFollowing,
      followerCounts: mockFollowerCounts,

      updateProfile: (userId, edits) =>
        set((state) => {
          const user = state.users[userId];
          if (!user) return state;

          return { users: { ...state.users, [userId]: { ...user, ...edits } } };
        }),

      toggleFollow: (userId) =>
        set((state) => {
          const isFollowing = state.following.includes(userId);
          const delta = isFollowing ? -1 : 1;

          return {
            following: isFollowing
              ? state.following.filter((id) => id !== userId)
              : [...state.following, userId],
            followerCounts: {
              ...state.followerCounts,
              [userId]: Math.max(0, (state.followerCounts[userId] ?? 0) + delta),
            },
          };
        }),

      upsertUsers: (users) =>
        set((state) => ({
          users: {
            ...state.users,
            ...Object.fromEntries(users.map((user) => [user.id, user])),
          },
        })),

      markSpotifyConnected: (userId, connected) =>
        set((state) => {
          const user = state.users[userId];
          if (!user) return state;

          return {
            users: { ...state.users, [userId]: { ...user, spotifyConnected: connected } },
          };
        }),
    }),
    {
      name: 'vibe-users',
      version: 1,
      storage: createJSONStorage(() => asyncStorage),
      // Other people's profiles will come from the backend, so only the local
      // user's customization and follow graph are worth keeping on device.
      partialize: (state) => ({
        users: { [CURRENT_USER_ID]: state.users[CURRENT_USER_ID] },
        following: state.following,
        followerCounts: state.followerCounts,
      }),
      merge: (persisted, current) => {
        const saved = persisted as Partial<UsersState> | undefined;

        return {
          ...current,
          ...saved,
          users: { ...current.users, ...saved?.users },
        };
      },
    }
  )
);

export function useUser(userId: string) {
  return useUsersStore((state) => state.users[userId]);
}

export function useIsFollowing(userId: string) {
  return useUsersStore((state) => state.following.includes(userId));
}

export function useFollowingCount() {
  return useUsersStore((state) => state.following.length);
}

export function useFollowerCount(userId: string) {
  return useUsersStore((state) => state.followerCounts[userId] ?? 0);
}

/** Everyone the current user does not follow yet, optionally filtered by query. */
export function useSuggestedUsers(query = '') {
  const normalized = query.trim().toLowerCase();

  return useUsersStore(
    useShallow((state) =>
      Object.values(state.users).filter((user) => {
        if (user.id === CURRENT_USER_ID) return false;
        if (!normalized) return true;

        return (
          user.displayName.toLowerCase().includes(normalized) ||
          user.handle.toLowerCase().includes(normalized)
        );
      })
    )
  );
}
