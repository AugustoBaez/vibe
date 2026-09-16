import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { FollowButton } from '@/components/follow-button';
import { ThemedText } from '@/components/themed-text';
import { Avatar } from '@/components/ui/avatar';
import { Radius, Spacing } from '@/constants/theme';
import { formatCount } from '@/lib/format';
import { useFollowerCount, useUser } from '@/stores/users-store';

export function UserRow({ userId }: { userId: string }) {
  const router = useRouter();
  const user = useUser(userId);
  const followers = useFollowerCount(userId);

  if (!user) return null;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push({ pathname: '/user/[id]', params: { id: userId } })}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <Avatar user={user} size={44} />

      <View style={styles.meta}>
        <ThemedText type="defaultBold" numberOfLines={1}>
          {user.displayName}
        </ThemedText>
        <ThemedText type="tiny" themeColor="textSecondary" numberOfLines={1}>
          @{user.handle} · {formatCount(followers)} followers
        </ThemedText>
      </View>

      <FollowButton userId={userId} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
    borderRadius: Radius.medium,
  },
  meta: {
    flex: 1,
    gap: Spacing.half,
  },
  pressed: {
    opacity: 0.6,
  },
});
