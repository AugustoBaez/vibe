import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PostCard } from '@/components/post-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Icon } from '@/components/ui/icon';
import { ScreenHeader } from '@/components/ui/screen-header';
import { BottomTabInset, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useFeedPostIds } from '@/stores/feed-store';
import { useCurrentUserId } from '@/stores/session-store';
import { useUsersStore } from '@/stores/users-store';

type Scope = 'following' | 'everyone';

export default function FeedScreen() {
  const theme = useTheme();
  const router = useRouter();
  const currentUserId = useCurrentUserId();
  const [scope, setScope] = useState<Scope>('everyone');

  const following = useUsersStore((state) => state.following);
  const authorIds = useMemo(
    () => (scope === 'following' ? [...following, currentUserId] : undefined),
    [scope, following, currentUserId]
  );

  const postIds = useFeedPostIds(authorIds);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScreenHeader
          title="vibe"
          subtitle="what everyone is listening to"
          action={
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Share a song"
              onPress={() => router.push('/compose')}
              style={({ pressed }) => [pressed && styles.pressed]}>
              <Icon name="compose" size={30} color={theme.accent} />
            </Pressable>
          }
        />

        <View style={styles.scopeRow}>
          {(['everyone', 'following'] as const).map((value) => (
            <Pressable
              key={value}
              accessibilityRole="button"
              onPress={() => setScope(value)}
              style={({ pressed }) => [
                styles.scopeChip,
                {
                  backgroundColor:
                    scope === value ? theme.backgroundSelected : theme.backgroundElement,
                },
                pressed && styles.pressed,
              ]}>
              <ThemedText
                type="smallBold"
                themeColor={scope === value ? 'text' : 'textSecondary'}>
                {value === 'everyone' ? 'Everyone' : 'Following'}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        <FlatList
          data={postIds}
          keyExtractor={(postId) => postId}
          renderItem={({ item }) => <PostCard postId={item} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon="headphones"
              title="Nothing here yet"
              description={
                scope === 'following'
                  ? 'Add some people in Discover to fill this up.'
                  : 'Share the first song of the day.'
              }
              action={
                <Button
                  label={scope === 'following' ? 'Find people' : 'Share a song'}
                  size="small"
                  onPress={() => router.push(scope === 'following' ? '/discover' : '/compose')}
                />
              }
            />
          }
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scopeRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.two,
  },
  scopeChip: {
    paddingVertical: Spacing.one + 2,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.pill,
  },
  list: {
    paddingBottom: BottomTabInset + Spacing.four,
  },
  pressed: {
    opacity: 0.6,
  },
});
