import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';
import { View } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SpotifyAuthProvider } from '@/lib/spotify/auth';
import { useSpotifySync } from '@/lib/spotify/use-spotify-sync';
import { useIsSignedIn, useSessionHydrated, useSessionStore } from '@/stores/session-store';

SplashScreen.preventAutoHideAsync();
void SystemUI.setBackgroundColorAsync(Colors.dark.background);

export default function RootLayout() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  const hydrated = useSessionHydrated();
  const isSignedIn = useIsSignedIn();

  useSpotifySync();

  useEffect(() => {
    if (hydrated) {
      void SplashScreen.hideAsync();
      return;
    }

    const timeout = setTimeout(() => {
      useSessionStore.setState({ hydrated: true });
      void SplashScreen.hideAsync();
    }, 1500);

    return () => clearTimeout(timeout);
  }, [hydrated]);

  const base = isDark ? DarkTheme : DefaultTheme;
  const navigationTheme = {
    ...base,
    colors: {
      ...base.colors,
      background: colors.background,
      card: colors.background,
      text: colors.text,
      border: colors.border,
      primary: colors.accent,
    },
  };

  return (
    <ThemeProvider value={navigationTheme}>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar style="light" />
        <SpotifyAuthProvider>
          <Stack screenOptions={{ headerBackButtonDisplayMode: 'minimal', contentStyle: { backgroundColor: colors.background } }}>
            <Stack.Protected guard={!isSignedIn}>
              <Stack.Screen name="connect" options={{ headerShown: false }} />
            </Stack.Protected>

            <Stack.Screen name="spotify-auth" options={{ headerShown: false }} />

            <Stack.Protected guard={isSignedIn}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="post/[id]" options={{ title: 'Post' }} />
              <Stack.Screen name="user/[id]" options={{ title: '' }} />
              <Stack.Screen
                name="compose"
                options={{ title: 'Share a song', presentation: 'modal' }}
              />
              <Stack.Screen
                name="edit-profile"
                options={{ title: 'Customize profile', presentation: 'modal' }}
              />
            </Stack.Protected>
          </Stack>
        </SpotifyAuthProvider>
      </View>
    </ThemeProvider>
  );
}
