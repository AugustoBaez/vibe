import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PlaylistCard } from '@/components/playlist-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TrackRow } from '@/components/track-row';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Section } from '@/components/ui/section';
import { TextField } from '@/components/ui/text-field';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { usePlaylists, useSearchTracks } from '@/stores/catalog-store';
import { useFeedStore } from '@/stores/feed-store';
import { useCurrentUserId } from '@/stores/session-store';
import { useUser } from '@/stores/users-store';
import type { PostSubject } from '@/types';

type Kind = 'track' | 'playlist';

export default function ComposeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const currentUserId = useCurrentUserId();
  const me = useUser(currentUserId);
  const createPost = useFeedStore((state) => state.createPost);

  const [kind, setKind] = useState<Kind>('track');
  const [query, setQuery] = useState('');
  const [subject, setSubject] = useState<PostSubject | null>(null);
  const [caption, setCaption] = useState('');

  const tracks = useSearchTracks(query);
  const playlists = usePlaylists(me?.playlistIds ?? []);

  function share() {
    if (!subject) return;

    createPost({ authorId: currentUserId, caption, subject });
    router.back();
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.kindRow}>
          {(['track', 'playlist'] as const).map((value) => (
            <Pressable
              key={value}
              accessibilityRole="button"
              onPress={() => {
                setKind(value);
                setSubject(null);
              }}
              style={({ pressed }) => [
                styles.kindChip,
                {
                  backgroundColor:
                    kind === value ? theme.backgroundSelected : theme.backgroundElement,
                },
                pressed && styles.pressed,
              ]}>
              <ThemedText type="smallBold" themeColor={kind === value ? 'text' : 'textSecondary'}>
                {value === 'track' ? 'Song' : 'Playlist'}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        {kind === 'track' ? (
          <>
            <View style={styles.padded}>
              <TextField
                placeholder="Search your songs"
                value={query}
                onChangeText={setQuery}
                autoCorrect={false}
                autoCapitalize="none"
                clearButtonMode="while-editing"
              />
            </View>

            <Section title="Pick a song">
              <View style={styles.sectionBody}>
                {tracks.map((track) => (
                  <TrackRow
                    key={track.id}
                    track={track}
                    selected={subject?.kind === 'track' && subject.trackId === track.id}
                    onPress={() => setSubject({ kind: 'track', trackId: track.id })}
                  />
                ))}
              </View>
            </Section>
          </>
        ) : (
          <Section title="Pick a playlist">
            <View style={styles.sectionBody}>
              {playlists.length === 0 ? (
                <EmptyState
                  icon="playlist"
                  title="No playlists yet"
                  description="Connect Spotify to pull in your playlists."
                />
              ) : (
                playlists.map((playlist) => (
                  <PlaylistCard
                    key={playlist.id}
                    playlist={playlist}
                    selected={subject?.kind === 'playlist' && subject.playlistId === playlist.id}
                    onPress={() => setSubject({ kind: 'playlist', playlistId: playlist.id })}
                  />
                ))
              )}
            </View>
          </Section>
        )}

        <View style={styles.padded}>
          <TextField
            label="Caption"
            placeholder="Say something about it"
            value={caption}
            onChangeText={setCaption}
            multiline
            maxLength={280}
            hint={`${caption.length}/280`}
          />
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            borderTopColor: theme.border,
            paddingBottom: Math.max(insets.bottom, Spacing.three),
          },
        ]}>
        <Button
          label={subject ? 'Share to feed' : 'Pick something to share'}
          disabled={!subject}
          onPress={share}
          stretch
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    gap: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.four,
  },
  kindRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  kindChip: {
    paddingVertical: Spacing.one + 2,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.pill,
  },
  padded: {
    paddingHorizontal: Spacing.three,
  },
  sectionBody: {
    paddingHorizontal: Spacing.two,
  },
  footer: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  pressed: {
    opacity: 0.6,
  },
});
