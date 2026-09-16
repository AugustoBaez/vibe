import { Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ProfileView } from '@/components/profile-view';
import { ThemedView } from '@/components/themed-view';
import { useUser } from '@/stores/users-store';

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useUser(id);

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: user ? `@${user.handle}` : 'Profile' }} />
      <ProfileView userId={id} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
