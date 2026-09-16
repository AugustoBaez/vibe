import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Artwork } from '@/components/ui/artwork';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatDuration } from '@/lib/format';
import { openSpotifyLink } from '@/lib/open-link';
import type { Track } from '@/types';

export type TrackRowProps = {
  track: Track;
  /** 1-based rank, shown on "top tracks" lists. */
  rank?: number;
  right?: React.ReactNode;
  onPress?: () => void;
  selected?: boolean;
};

export function TrackRow({ track, rank, right, onPress, selected = false }: TrackRowProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${track.name} by ${track.artist}`}
      onPress={onPress ?? (() => openSpotifyLink(track.spotifyUrl))}
      style={({ pressed }) => [
        styles.row,
        selected && { backgroundColor: theme.backgroundSelected },
        pressed && styles.pressed,
      ]}>
      {rank ? (
        <ThemedText type="smallBold" themeColor="textSecondary" style={styles.rank}>
          {rank}
        </ThemedText>
      ) : null}

      <Artwork seed={track.id} url={track.artworkUrl} size={48} />

      <View style={styles.meta}>
        <ThemedText type="defaultBold" numberOfLines={1}>
          {track.name}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
          {track.artist} · {track.album}
        </ThemedText>
      </View>

      {right ?? (
        <ThemedText type="tiny" themeColor="textSecondary">
          {formatDuration(track.durationMs)}
        </ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
    borderRadius: Radius.medium,
  },
  rank: {
    width: 18,
    textAlign: 'center',
  },
  meta: {
    flex: 1,
    gap: Spacing.half,
  },
  pressed: {
    opacity: 0.6,
  },
});
