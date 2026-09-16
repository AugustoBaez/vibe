import * as Crypto from 'expo-crypto';
import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';

import { mockComments, mockPosts } from '@/lib/mock-data';
import type { Comment, Post, PostSubject } from '@/types';

/**
 * Posts, likes and comments. Kept in memory on purpose: this is the part of the
 * app the backend will own, so persisting it locally would be throwaway work.
 */
type FeedState = {
  posts: Record<string, Post>;
  comments: Record<string, Comment>;

  createPost: (input: { authorId: string; caption: string; subject: PostSubject }) => string;
  deletePost: (postId: string) => void;
  toggleLike: (postId: string, userId: string) => void;
  addComment: (input: { postId: string; authorId: string; body: string }) => void;
};

function byId<T extends { id: string }>(items: T[]) {
  return Object.fromEntries(items.map((item) => [item.id, item]));
}

export const useFeedStore = create<FeedState>()((set) => ({
  posts: byId(mockPosts),
  comments: byId(mockComments),

  createPost: ({ authorId, caption, subject }) => {
    const post: Post = {
      id: Crypto.randomUUID(),
      authorId,
      caption: caption.trim(),
      subject,
      createdAt: Date.now(),
      likedBy: [],
    };

    set((state) => ({ posts: { ...state.posts, [post.id]: post } }));

    return post.id;
  },

  deletePost: (postId) =>
    set((state) => {
      const { [postId]: removed, ...posts } = state.posts;
      if (!removed) return state;

      const comments = Object.fromEntries(
        Object.entries(state.comments).filter(([, comment]) => comment.postId !== postId)
      );

      return { posts, comments };
    }),

  toggleLike: (postId, userId) =>
    set((state) => {
      const post = state.posts[postId];
      if (!post) return state;

      const likedBy = post.likedBy.includes(userId)
        ? post.likedBy.filter((id) => id !== userId)
        : [...post.likedBy, userId];

      return { posts: { ...state.posts, [postId]: { ...post, likedBy } } };
    }),

  addComment: ({ postId, authorId, body }) =>
    set((state) => {
      const trimmed = body.trim();
      if (!trimmed || !state.posts[postId]) return state;

      const comment: Comment = {
        id: Crypto.randomUUID(),
        postId,
        authorId,
        body: trimmed,
        createdAt: Date.now(),
      };

      return { comments: { ...state.comments, [comment.id]: comment } };
    }),
}));

const newestFirst = (a: Post, b: Post) => b.createdAt - a.createdAt;

/** Post ids for the home feed, newest first. */
export function useFeedPostIds(authorIds?: string[]) {
  return useFeedStore(
    useShallow((state) =>
      Object.values(state.posts)
        .filter((post) => !authorIds || authorIds.includes(post.authorId))
        .sort(newestFirst)
        .map((post) => post.id)
    )
  );
}

export function usePostIdsByAuthor(authorId: string) {
  return useFeedStore(
    useShallow((state) =>
      Object.values(state.posts)
        .filter((post) => post.authorId === authorId)
        .sort(newestFirst)
        .map((post) => post.id)
    )
  );
}

export function usePost(postId: string) {
  return useFeedStore((state) => state.posts[postId]);
}

export function useLikeCount(postId: string) {
  return useFeedStore((state) => state.posts[postId]?.likedBy.length ?? 0);
}

export function useIsLikedBy(postId: string, userId: string) {
  return useFeedStore((state) => state.posts[postId]?.likedBy.includes(userId) ?? false);
}

export function useCommentIds(postId: string) {
  return useFeedStore(
    useShallow((state) =>
      Object.values(state.comments)
        .filter((comment) => comment.postId === postId)
        .sort((a, b) => a.createdAt - b.createdAt)
        .map((comment) => comment.id)
    )
  );
}

export function useComment(commentId: string) {
  return useFeedStore((state) => state.comments[commentId]);
}

export function useCommentCount(postId: string) {
  return useFeedStore(
    (state) =>
      Object.values(state.comments).filter((comment) => comment.postId === postId).length
  );
}
