import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { LikeButton } from '@/components/like-button';
import { PlaylistCard } from '@/components/playlist-card';
import { ThemedText } from '@/components/themed-text';
import { TrackRow } from '@/components/track-row';
import { Avatar } from '@/components/ui/avatar';
import { Icon } from '@/components/ui/icon';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatRelativeTime } from '@/lib/format';
import { usePlaylist, useTrack } from '@/stores/catalog-store';
import {
  useCommentCount,
  useFeedStore,
  useIsLikedBy,
  useLikeCount,
  usePost,
} from '@/stores/feed-store';
import { useCurrentUserId } from '@/stores/session-store';
import { useUser } from '@/stores/users-store';
import type { PostSubject } from '@/types';

function PostSubjectView({ subject }: { subject: PostSubject }) {
  const track = useTrack(subject.kind === 'track' ? subject.trackId : null);
  const playlist = usePlaylist(subject.kind === 'playlist' ? subject.playlistId : null);

  if (track) return <TrackRow track={track} />;
  if (playlist) return <PlaylistCard playlist={playlist} />;

  return null;
}

export function PostCard({ postId }: { postId: string }) {
  const theme = useTheme();
  const router = useRouter();

  const post = usePost(postId);
  const author = useUser(post?.authorId ?? '');
  const currentUserId = useCurrentUserId();
  const likeCount = useLikeCount(postId);
  const commentCount = useCommentCount(postId);
  const liked = useIsLikedBy(postId, currentUserId);
  const toggleLike = useFeedStore((state) => state.toggleLike);

  if (!post || !author) return null;

  function openComments() {
    router.push({ pathname: '/post/[id]', params: { id: postId } });
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Open comments"
      onPress={openComments}
      style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}>
      <Pressable
        accessibilityRole="button"
        onPress={(event) => {
          event.stopPropagation();
          router.push({ pathname: '/user/[id]', params: { id: author.id } });
        }}
        style={({ pressed }) => [styles.header, pressed && styles.pressed]}>
        <Avatar user={author} size={40} />

        <View style={styles.headerMeta}>
          <ThemedText type="defaultBold" numberOfLines={1}>
            {author.displayName}
          </ThemedText>
          <ThemedText type="tiny" themeColor="textSecondary" numberOfLines={1}>
            @{author.handle} · {formatRelativeTime(post.createdAt)}
          </ThemedText>
        </View>
      </Pressable>

      {post.caption ? <ThemedText style={styles.caption}>{post.caption}</ThemedText> : null}

      <View style={[styles.subject, { borderColor: theme.border }]}>
        <PostSubjectView subject={post.subject} />
      </View>

      <View style={styles.actions}>
        <LikeButton
          liked={liked}
          count={likeCount}
          onPress={() => toggleLike(postId, currentUserId)}
        />

        <View style={styles.action}>
          <Icon name="comment" size={18} color={theme.textSecondary} />
          <ThemedText type="small" themeColor="textSecondary">
            {commentCount}
          </ThemedText>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.two,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  headerMeta: {
    flex: 1,
    gap: Spacing.half,
  },
  caption: {
    paddingHorizontal: Spacing.half,
  },
  subject: {
    borderRadius: Radius.medium,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.one,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one + 2,
    paddingVertical: Spacing.one,
    minWidth: 44,
  },
  pressed: {
    opacity: 0.6,
  },
});
