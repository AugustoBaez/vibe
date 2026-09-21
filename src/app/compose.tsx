import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PlaylistCard } from '@/components/playlist-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TrackRow } from '@/components/track-row';
import { Artwork } from '@/components/ui/artwork';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Section } from '@/components/ui/section';
import { TextField } from '@/components/ui/text-field';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useTrackSearch } from '@/lib/spotify/use-track-search';
import { usePlaylist, usePlaylists, useTrack } from '@/stores/catalog-store';
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

  const { tracks, loading, connected } = useTrackSearch(query);
  const playlists = usePlaylists(me?.playlistIds ?? []);
  const selectedTrack = useTrack(subject?.kind === 'track' ? subject.trackId : null);
  const selectedPlaylist = usePlaylist(subject?.kind === 'playlist' ? subject.playlistId : null);

  function share() {
    if (!subject) return;

    createPost({ authorId: currentUserId, caption, subject });
    router.back();
  }

  const noTrackMatches = kind === 'track' && query.trim().length > 0 && !loading && tracks.length === 0;

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
                placeholder={connected ? 'Search Spotify' : 'Search songs'}
                value={query}
                onChangeText={setQuery}
                autoCorrect={false}
                autoCapitalize="none"
                returnKeyType="search"
                clearButtonMode="while-editing"
                hint={
                  connected
                    ? undefined
                    : 'Connect Spotify to search the full catalog.'
                }
              />
            </View>

            {selectedTrack ? (
              <View style={styles.padded}>
                <View
                  style={[
                    styles.preview,
                    { backgroundColor: theme.backgroundElement, borderColor: theme.border },
                  ]}>
                  <Artwork seed={selectedTrack.id} url={selectedTrack.artworkUrl} size={132} />
                  <View style={styles.previewMeta}>
                    <ThemedText type="small" themeColor="textSecondary">
                      Sharing
                    </ThemedText>
                    <ThemedText type="defaultBold" numberOfLines={2}>
                      {selectedTrack.name}
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary" numberOfLines={2}>
                      {selectedTrack.artist}
                    </ThemedText>
                  </View>
                </View>
              </View>
            ) : null}

            <Section title={connected && query.trim() ? 'Spotify results' : 'Pick a song'}>
              <View style={styles.sectionBody}>
                {loading ? (
                  <View style={styles.loading}>
                    <ActivityIndicator color={theme.accent} />
                  </View>
                ) : noTrackMatches ? (
                  <EmptyState
                    icon="search"
                    title="No songs found"
                    description={
                      connected
                        ? `Nothing on Spotify matched “${query.trim()}”.`
                        : 'Connect Spotify to search every song.'
                    }
                  />
                ) : (
                  tracks.map((track) => (
                    <TrackRow
                      key={track.id}
                      track={track}
                      selected={subject?.kind === 'track' && subject.trackId === track.id}
                      onPress={() => setSubject({ kind: 'track', trackId: track.id })}
                    />
                  ))
                )}
              </View>
            </Section>
          </>
        ) : (
          <>
            {selectedPlaylist ? (
              <View style={styles.padded}>
                <View
                  style={[
                    styles.preview,
                    { backgroundColor: theme.backgroundElement, borderColor: theme.border },
                  ]}>
                  <Artwork
                    seed={selectedPlaylist.id}
                    url={selectedPlaylist.artworkUrl}
                    size={132}
                    kind="playlist"
                  />
                  <View style={styles.previewMeta}>
                    <ThemedText type="small" themeColor="textSecondary">
                      Sharing
                    </ThemedText>
                    <ThemedText type="defaultBold" numberOfLines={2}>
                      {selectedPlaylist.name}
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary" numberOfLines={2}>
                      {selectedPlaylist.trackCount} tracks · {selectedPlaylist.ownerName}
                    </ThemedText>
                  </View>
                </View>
              </View>
            ) : null}

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
          </>
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
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.two,
    borderRadius: Radius.medium,
    borderWidth: StyleSheet.hairlineWidth,
  },
  previewMeta: {
    flex: 1,
    gap: Spacing.half,
  },
  sectionBody: {
    paddingHorizontal: Spacing.two,
  },
  loading: {
    paddingVertical: Spacing.five,
    alignItems: 'center',
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
