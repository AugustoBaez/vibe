import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CommentRow } from '@/components/comment-row';
import { PostCard } from '@/components/post-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Avatar } from '@/components/ui/avatar';
import { EmptyState } from '@/components/ui/empty-state';
import { Icon } from '@/components/ui/icon';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCommentIds, useFeedStore, usePost } from '@/stores/feed-store';
import { useCurrentUserId } from '@/stores/session-store';
import { useUser } from '@/stores/users-store';

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const post = usePost(id);
  const commentIds = useCommentIds(id);
  const currentUserId = useCurrentUserId();
  const me = useUser(currentUserId);
  const addComment = useFeedStore((state) => state.addComment);

  const [draft, setDraft] = useState('');
  const canSend = draft.trim().length > 0;

  function submit() {
    if (!canSend) return;

    addComment({ postId: id, authorId: currentUserId, body: draft });
    setDraft('');
  }

  if (!post) {
    return (
      <ThemedView style={styles.container}>
        <EmptyState icon="close" title="Post not found" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList
          data={commentIds}
          keyExtractor={(commentId) => commentId}
          renderItem={({ item }) => <CommentRow commentId={item} />}
          ListHeaderComponent={
            <View>
              <PostCard postId={id} />
              <ThemedText type="smallBold" themeColor="textSecondary" style={styles.commentsTitle}>
                {commentIds.length === 0
                  ? 'NO COMMENTS YET'
                  : `${commentIds.length} COMMENT${commentIds.length === 1 ? '' : 'S'}`}
              </ThemedText>
            </View>
          }
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        />

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
    paddingBottom: Spacing.four,
  },
  commentsTitle: {
    letterSpacing: 1,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
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
