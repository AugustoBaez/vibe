import { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DemoSignInButton, SpotifyConnectButton } from '@/components/spotify-connect-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Icon } from '@/components/ui/icon';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { gradientFromSeed } from '@/lib/gradient';
import { getSpotifyRedirectUri } from '@/lib/spotify/auth';
import { SPOTIFY_ENABLED } from '@/lib/spotify/config';

const perks = [
  { icon: 'stats', text: 'Your top songs, straight from Spotify' },
  { icon: 'compose', text: 'Share songs and playlists to a feed' },
  { icon: 'addPerson', text: 'Follow friends and see what they play' },
] as const;

export default function ConnectScreen() {
  const theme = useTheme();
  const redirectUri = getSpotifyRedirectUri();

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    if (window.location.hostname !== 'localhost') return;

    const next = new URL(window.location.href);
    next.hostname = '127.0.0.1';
    window.location.replace(next.toString());
  }, []);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.hero}>
          <View
            style={[
              styles.logo,
              { experimental_backgroundImage: gradientFromSeed('vibe', 150).backgroundImage },
            ]}>
            <Icon name="headphones" size={44} color="#FFFFFF" />
          </View>

          <ThemedText type="title">vibe</ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.tagline}>
            a social feed built on what you actually listen to
          </ThemedText>
        </View>

        <View style={styles.perks}>
          {perks.map((perk) => (
            <View key={perk.text} style={styles.perk}>
              <Icon name={perk.icon} size={18} color={theme.accent} />
              <ThemedText type="small" style={styles.perkText}>
                {perk.text}
              </ThemedText>
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          <SpotifyConnectButton />
          <DemoSignInButton variant={SPOTIFY_ENABLED ? 'ghost' : 'primary'} />

          <ThemedText type="tiny" themeColor="textSecondary" style={styles.footnote}>
            {SPOTIFY_ENABLED
              ? 'Add this exact Redirect URI in the Spotify dashboard, then save:'
              : 'Running on demo data. Set EXPO_PUBLIC_SPOTIFY_CLIENT_ID in .env to connect a real Spotify account.'}
          </ThemedText>
          {SPOTIFY_ENABLED ? (
            <ThemedText type="code" themeColor="textSecondary" selectable style={styles.redirect}>
              {redirectUri}
            </ThemedText>
          ) : null}
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    justifyContent: 'space-between',
    gap: Spacing.four,
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  logo: {
    width: 96,
    height: 96,
    borderRadius: Radius.large,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.three,
  },
  tagline: {
    textAlign: 'center',
    maxWidth: 280,
  },
  perks: {
    gap: Spacing.three,
    paddingHorizontal: Spacing.two,
  },
  perk: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  perkText: {
    flex: 1,
  },
  actions: {
    gap: Spacing.two,
    paddingBottom: Spacing.four,
  },
  footnote: {
    textAlign: 'center',
    paddingTop: Spacing.one,
  },
  redirect: {
    textAlign: 'center',
  },
});
