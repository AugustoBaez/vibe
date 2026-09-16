import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Avatar } from '@/components/ui/avatar';
import { Spacing } from '@/constants/theme';
import { formatRelativeTime } from '@/lib/format';
import { useComment } from '@/stores/feed-store';
import { useUser } from '@/stores/users-store';

export function CommentRow({ commentId }: { commentId: string }) {
  const comment = useComment(commentId);
  const author = useUser(comment?.authorId ?? '');

  if (!comment || !author) return null;

  return (
    <View style={styles.row}>
      <Avatar user={author} size={32} />

      <View style={styles.body}>
        <View style={styles.byline}>
          <ThemedText type="smallBold">{author.displayName}</ThemedText>
          <ThemedText type="tiny" themeColor="textSecondary">
            {formatRelativeTime(comment.createdAt)}
          </ThemedText>
        </View>
        <ThemedText type="small">{comment.body}</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  body: {
    flex: 1,
    gap: Spacing.half,
  },
  byline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
});
