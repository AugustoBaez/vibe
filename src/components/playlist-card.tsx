import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Artwork } from '@/components/ui/artwork';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { openSpotifyLink } from '@/lib/open-link';
import type { Playlist } from '@/types';

export type PlaylistCardProps = {
  playlist: Playlist;
  onPress?: () => void;
  selected?: boolean;
};

export function PlaylistCard({ playlist, onPress, selected = false }: PlaylistCardProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Playlist ${playlist.name}`}
      onPress={onPress ?? (() => openSpotifyLink(playlist.spotifyUrl))}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: selected ? theme.backgroundSelected : theme.backgroundElement },
        pressed && styles.pressed,
      ]}>
      <Artwork seed={playlist.id} url={playlist.artworkUrl} size={64} kind="playlist" />

      <View style={styles.meta}>
        <ThemedText type="defaultBold" numberOfLines={1}>
          {playlist.name}
        </ThemedText>
        {playlist.description ? (
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
            {playlist.description}
          </ThemedText>
        ) : null}
        <ThemedText type="tiny" themeColor="textSecondary">
          {playlist.trackCount} tracks · {playlist.ownerName}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.two,
    borderRadius: Radius.medium,
  },
  meta: {
    flex: 1,
    gap: Spacing.half,
  },
  pressed: {
    opacity: 0.7,
  },
});
