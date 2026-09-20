import { useLocalSearchParams, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Spacing } from '@/constants/theme';
import { completeSpotifyLogin } from '@/lib/spotify/auth';
import { useIsSignedIn } from '@/stores/session-store';

WebBrowser.maybeCompleteAuthSession();

function firstParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default function SpotifyAuthRedirect() {
  const router = useRouter();
  const isSignedIn = useIsSignedIn();
  const params = useLocalSearchParams<{ code?: string | string[]; error?: string | string[] }>();
  const [message, setMessage] = useState('Finishing Spotify login…');
  const [failed, setFailed] = useState<string | null>(null);

  useEffect(() => {
    if (isSignedIn) {
      router.replace('/(tabs)');
    }
  }, [isSignedIn, router]);

  useEffect(() => {
    const code = firstParam(params.code);
    const authError = firstParam(params.error);

    if (authError) {
      setFailed(authError === 'access_denied' ? 'Spotify login was cancelled.' : authError);
      return;
    }

    if (!code) return;

    let cancelled = false;

    void completeSpotifyLogin(code)
      .then(() => {
        if (!cancelled) router.replace('/(tabs)');
      })
      .catch((cause) => {
        if (cancelled) return;
        setFailed(cause instanceof Error ? cause.message : 'Could not finish Spotify login.');
        setMessage('Login failed');
      });

    return () => {
      cancelled = true;
    };
  }, [params.code, params.error, router]);

  useEffect(() => {
    if (firstParam(params.code) || firstParam(params.error) || isSignedIn) return;

    const timeout = setTimeout(() => {
      router.replace('/connect');
    }, 2500);

    return () => clearTimeout(timeout);
  }, [params.code, params.error, isSignedIn, router]);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.body}>
        {failed ? null : <ActivityIndicator />}
        <ThemedText type="small" themeColor="textSecondary" style={styles.message}>
          {failed ?? message}
        </ThemedText>
        {failed ? (
          <Button label="Back to sign in" onPress={() => router.replace('/connect')} />
        ) : null}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  body: {
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  message: {
    textAlign: 'center',
  },
});
