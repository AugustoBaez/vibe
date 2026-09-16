import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProfileView } from '@/components/profile-view';
import { ThemedView } from '@/components/themed-view';
import { Icon } from '@/components/ui/icon';
import { ScreenHeader } from '@/components/ui/screen-header';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCurrentUserId, useIsDemoMode, useSessionStore } from '@/stores/session-store';

export default function ProfileScreen() {
  const theme = useTheme();
  const currentUserId = useCurrentUserId();
  const isDemoMode = useIsDemoMode();
  const signOut = useSessionStore((state) => state.signOut);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScreenHeader
          title="Your profile"
          subtitle={isDemoMode ? 'demo data · Spotify not linked' : undefined}
          action={
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Sign out"
              onPress={signOut}
              style={({ pressed }) => [pressed && styles.pressed]}>
              <Icon name="signOut" size={22} color={theme.textSecondary} />
            </Pressable>
          }
        />

        <ProfileView userId={currentUserId} bottomInset={BottomTabInset + Spacing.four} />
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
  pressed: {
    opacity: 0.6,
  },
});
