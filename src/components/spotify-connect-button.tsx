import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { isExpoGo, useSpotifyAuthContext } from '@/lib/spotify/auth';
import { SPOTIFY_ENABLED } from '@/lib/spotify/config';
import { useSessionStore } from '@/stores/session-store';

/**
 * Kept as its own component so `useSpotifyAuth` is only mounted when a client
 * id is actually configured.
 */
function RealSpotifyButton() {
  const theme = useTheme();
  const { connect, pending, error, ready } = useSpotifyAuthContext();

  if (isExpoGo) {
    return (
      <ThemedText type="tiny" themeColor="textSecondary" style={styles.warning}>
        Spotify login does not work in Expo Go. Open the web app at http://127.0.0.1:8083 or run a
        development build.
      </ThemedText>
    );
  }

  return (
    <View style={styles.group}>
      <Button
        label="Continue with Spotify"
        icon="headphones"
        loading={pending}
        disabled={!ready}
        onPress={connect}
        stretch
      />
      {error ? (
        <ThemedText type="tiny" style={{ color: theme.like }}>
          {error}
        </ThemedText>
      ) : null}
    </View>
  );
}

export function SpotifyConnectButton() {
  if (!SPOTIFY_ENABLED) return null;

  return <RealSpotifyButton />;
}

export function DemoSignInButton({ variant = 'primary' }: { variant?: 'primary' | 'ghost' }) {
  const signInAsDemo = useSessionStore((state) => state.signInAsDemo);

  return (
    <Button
      label={variant === 'primary' ? 'Explore with demo data' : 'Skip, use demo data'}
      variant={variant}
      onPress={signInAsDemo}
      stretch
    />
  );
}

const styles = StyleSheet.create({
  group: {
    alignSelf: 'stretch',
    gap: Spacing.two,
  },
  warning: {
    textAlign: 'center',
  },
});
