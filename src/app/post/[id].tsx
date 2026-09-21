import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CommentRow } from '@/components/comment-row';
import { CoverHero } from '@/components/cover-hero';
import { LikeButton } from '@/components/like-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Avatar } from '@/components/ui/avatar';
import { EmptyState } from '@/components/ui/empty-state';
import { Icon } from '@/components/ui/icon';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { usePreviewPlayer } from '@/hooks/use-preview-player';
import { useTheme } from '@/hooks/use-theme';
import { formatRelativeTime } from '@/lib/format';
import { usePlaylist, useTrack } from '@/stores/catalog-store';
import {
  useCommentIds,
  useFeedStore,
  useIsLikedBy,
  useLikeCount,
  usePost,
} from '@/stores/feed-store';
import { useCurrentUserId } from '@/stores/session-store';
import { useUser } from '@/stores/users-store';
import type { Post } from '@/types';

function usePostMedia(post: Post | undefined) {
  const track = useTrack(post?.subject.kind === 'track' ? post.subject.trackId : null);
  const playlist = usePlaylist(post?.subject.kind === 'playlist' ? post.subject.playlistId : null);
  const playlistTrack = useTrack(playlist?.trackIds[0]);

  if (track) {
    return {
      seed: track.id,
      coverUrl: track.artworkUrl,
      title: track.name,
      subtitle: track.artist,
      previewUrl: track.previewUrl,
    };
  }

  if (playlist) {
    return {
      seed: playlist.id,
      coverUrl: playlist.artworkUrl,
      title: playlist.name,
      subtitle: playlist.ownerName,
      previewUrl: playlistTrack?.previewUrl ?? '',
    };
  }

  return {
    seed: post?.id ?? 'post',
    coverUrl: '',
    title: 'Post',
    subtitle: '',
    previewUrl: '',
  };
}

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const scrollY = useSharedValue(0);

  const post = usePost(id);
  const media = usePostMedia(post);
  const commentIds = useCommentIds(id);
  const currentUserId = useCurrentUserId();
  const me = useUser(currentUserId);
  const author = useUser(post?.authorId ?? '');
  const likeCount = useLikeCount(id);
  const liked = useIsLikedBy(id, currentUserId);
  const addComment = useFeedStore((state) => state.addComment);
  const toggleLike = useFeedStore((state) => state.toggleLike);
  const preview = usePreviewPlayer(media.previewUrl);

  const [draft, setDraft] = useState('');
  const canSend = draft.trim().length > 0;
  const coverSize = Math.round(Math.min(width, MaxContentWidth));
  const blurDistance = Math.round(height * 0.4);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  function submit() {
    if (!canSend) return;

    addComment({ postId: id, authorId: currentUserId, body: draft });
    setDraft('');
  }

  if (!post || !author) {
    return (
      <ThemedView style={styles.container}>
        <EmptyState icon="close" title="Post not found" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: media.title, headerShadowVisible: false }} />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Animated.ScrollView
          key={id}
          style={styles.container}
          onScroll={onScroll}
          scrollEventThrottle={16}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}>
          <View style={styles.coverWrap}>
            <CoverHero
              url={media.coverUrl}
              seed={media.seed}
              width={coverSize}
              height={coverSize}
              scrollY={scrollY}
              blurDistance={blurDistance}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={preview.playing ? 'Pause preview' : 'Play preview'}
                onPress={preview.toggle}
                style={styles.coverHit}>
                <View style={styles.playBadge}>
                  <Icon name={preview.playing ? 'pause' : 'play'} size={22} color="#FFFFFF" />
                </View>

                <ThemedText type="heading" style={styles.coverTitle} numberOfLines={2}>
                  {media.title}
                </ThemedText>
                {media.subtitle ? (
                  <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                    {media.subtitle}
                  </ThemedText>
                ) : null}
              </Pressable>
            </CoverHero>
          </View>

          <View style={styles.meta}>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push({ pathname: '/user/[id]', params: { id: author.id } })}
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

            {post.caption ? <ThemedText>{post.caption}</ThemedText> : null}

            <LikeButton
              liked={liked}
              count={likeCount}
              onPress={() => toggleLike(id, currentUserId)}
            />

            <ThemedText type="smallBold" themeColor="textSecondary" style={styles.commentsTitle}>
              {commentIds.length === 0
                ? 'NO COMMENTS YET'
                : `${commentIds.length} COMMENT${commentIds.length === 1 ? '' : 'S'}`}
            </ThemedText>
          </View>

          {commentIds.length === 0 ? (
            <ThemedText type="small" themeColor="textSecondary" style={styles.emptyComments}>
              Be the first to say something.
            </ThemedText>
          ) : (
            commentIds.map((commentId) => <CommentRow key={commentId} commentId={commentId} />)
          )}
        </Animated.ScrollView>

        <View
          style={[
            styles.composer,
            {
              borderTopColor: theme.border,
              backgroundColor: theme.background,
              paddingBottom: Math.max(insets.bottom, Spacing.two),
            },
          ]}>
          {me ? <Avatar user={me} size={32} /> : null}

          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Add a comment"
            placeholderTextColor={theme.textSecondary}
            style={[
              styles.input,
              { backgroundColor: theme.backgroundElement, color: theme.text },
            ]}
            multiline
            onSubmitEditing={submit}
          />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Post comment"
            disabled={!canSend}
            onPress={submit}
            style={({ pressed }) => [!canSend && styles.disabled, pressed && styles.pressed]}>
            <Icon name="send" size={30} color={canSend ? theme.accent : theme.textSecondary} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flexGrow: 1,
    paddingBottom: Spacing.four,
  },
  coverWrap: {
    width: '100%',
    alignItems: 'center',
  },
  coverHit: {
    gap: Spacing.one,
  },
  playBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    marginBottom: Spacing.two,
  },
  coverTitle: {
    textShadowColor: 'rgba(0, 0, 0, 0.55)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 10,
  },
  meta: {
    paddingHorizontal: Spacing.three,
    gap: Spacing.two,
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
  commentsTitle: {
    letterSpacing: 1,
    paddingTop: Spacing.two,
  },
  emptyComments: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  input: {
    flex: 1,
    borderRadius: Radius.large,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
    fontSize: 16,
    maxHeight: 120,
    minHeight: 40,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.6,
  },
});
