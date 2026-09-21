import { Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProfileView } from '@/components/profile-view';
import { ThemedView } from '@/components/themed-view';
import { Icon } from '@/components/ui/icon';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useCurrentUserId, useIsDemoMode, useSessionStore } from '@/stores/session-store';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const currentUserId = useCurrentUserId();
  const isDemoMode = useIsDemoMode();
  const signOut = useSessionStore((state) => state.signOut);

  return (
    <ThemedView style={styles.container}>
      <ProfileView
        userId={currentUserId}
        topInset={insets.top}
        bottomInset={BottomTabInset + Spacing.four}
        subtitle={isDemoMode ? 'demo data · Spotify not linked' : undefined}
        headerAction={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Sign out"
            onPress={signOut}
            style={({ pressed }) => [styles.signOut, pressed && styles.pressed]}>
            <Icon name="signOut" size={20} color="#FFFFFF" />
          </Pressable>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  signOut: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  pressed: {
    opacity: 0.6,
  },
});
