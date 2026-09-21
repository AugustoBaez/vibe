import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { TrackRow } from '@/components/track-row';
import { EmptyState } from '@/components/ui/empty-state';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Section } from '@/components/ui/section';
import { TextField } from '@/components/ui/text-field';
import { UserRow } from '@/components/user-row';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useTrackSearch } from '@/lib/spotify/use-track-search';
import { useSuggestedUsers } from '@/stores/users-store';

export default function DiscoverScreen() {
  const theme = useTheme();
  const [query, setQuery] = useState('');

  const people = useSuggestedUsers(query);
  const { tracks, loading, connected } = useTrackSearch(query);
  const nothingFound =
    query.trim().length > 0 && !loading && people.length === 0 && tracks.length === 0;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScreenHeader title="Discover" subtitle="find people and songs" />

        <View style={styles.search}>
          <TextField
            placeholder={connected ? 'Search people or Spotify' : 'Search people or songs'}
            value={query}
            onChangeText={setQuery}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {nothingFound ? (
            <EmptyState
              icon="search"
              title="No matches"
              description={`Nothing found for “${query.trim()}”.`}
            />
          ) : null}

          {people.length > 0 ? (
            <Section title={query ? 'People' : 'People to add'}>
              <View style={styles.sectionBody}>
                {people.map((user) => (
                  <UserRow key={user.id} userId={user.id} />
                ))}
              </View>
            </Section>
          ) : null}

          {loading ? (
            <View style={styles.loading}>
              <ActivityIndicator color={theme.accent} />
            </View>
          ) : tracks.length > 0 ? (
            <Section title={query ? (connected ? 'Spotify' : 'Songs') : 'Trending with your people'}>
              <View style={styles.sectionBody}>
                {tracks.map((track) => (
                  <TrackRow key={track.id} track={track} />
                ))}
              </View>
            </Section>
          ) : null}
        </ScrollView>
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
  search: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.three,
  },
  content: {
    gap: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.four,
  },
  sectionBody: {
    paddingHorizontal: Spacing.two,
  },
  loading: {
    paddingVertical: Spacing.five,
    alignItems: 'center',
  },
});
