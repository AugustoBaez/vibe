import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PlaylistCard } from '@/components/playlist-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TrackRow } from '@/components/track-row';
import { Artwork } from '@/components/ui/artwork';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Icon } from '@/components/ui/icon';
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
      <View style={[styles.backRow, { paddingTop: Math.max(insets.top, Spacing.two) }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={12}
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
          <Icon name="back" size={24} color={theme.text} />
        </Pressable>
      </View>

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
                    styles.draft,
                    { backgroundColor: theme.backgroundElement, borderColor: theme.border },
                  ]}>
                  <TextInput
                    placeholder="what are u vibin to?"
                    placeholderTextColor={theme.textSecondary}
                    value={caption}
                    onChangeText={setCaption}
                    multiline
                    maxLength={280}
                    autoFocus
                    style={[styles.caption, { color: theme.text }]}
                  />
                  <View style={[styles.attached, { borderColor: theme.border }]}>
                    <Artwork seed={selectedTrack.id} url={selectedTrack.artworkUrl} size={56} />
                    <View style={styles.previewMeta}>
                      <ThemedText type="defaultBold" numberOfLines={1}>
                        {selectedTrack.name}
                      </ThemedText>
                      <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                        {selectedTrack.artist} · {selectedTrack.album}
                      </ThemedText>
                    </View>
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
                    styles.draft,
                    { backgroundColor: theme.backgroundElement, borderColor: theme.border },
                  ]}>
                  <TextInput
                    placeholder="what are u vibin to?"
                    placeholderTextColor={theme.textSecondary}
                    value={caption}
                    onChangeText={setCaption}
                    multiline
                    maxLength={280}
                    autoFocus
                    style={[styles.caption, { color: theme.text }]}
                  />
                  <View style={[styles.attached, { borderColor: theme.border }]}>
                    <Artwork
                      seed={selectedPlaylist.id}
                      url={selectedPlaylist.artworkUrl}
                      size={56}
                      kind="playlist"
                    />
                    <View style={styles.previewMeta}>
                      <ThemedText type="defaultBold" numberOfLines={1}>
                        {selectedPlaylist.name}
                      </ThemedText>
                      <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                        {selectedPlaylist.trackCount} tracks · {selectedPlaylist.ownerName}
                      </ThemedText>
                    </View>
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
      </ScrollView>

      {subject ? (
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, Spacing.three) }]}>
          <Button label="Share to feed" onPress={share} stretch />
        </View>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    gap: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.four,
  },
  backRow: {
    paddingHorizontal: Spacing.one,
    paddingBottom: Spacing.one,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
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
  draft: {
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.medium,
    borderWidth: StyleSheet.hairlineWidth,
  },
  caption: {
    fontSize: 16,
    lineHeight: 22,
    minHeight: 44,
    padding: 0,
    textAlignVertical: 'top',
  },
  attached: {
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
  },
  pressed: {
    opacity: 0.6,
  },
});
