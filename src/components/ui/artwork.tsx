import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { Radius } from '@/constants/theme';
import { gradientFromSeed } from '@/lib/gradient';

export type ArtworkProps = {
  /** Stable string (usually an id) that decides the placeholder gradient. */
  seed: string;
  url?: string;
  size?: number;
  kind?: 'track' | 'playlist';
  radius?: number;
};

export function Artwork({ seed, url, size = 56, kind = 'track', radius }: ArtworkProps) {
  const borderRadius = radius ?? Radius.small;

  if (url) {
    return (
      <Image
        source={{ uri: url }}
        style={{ width: size, height: size, borderRadius }}
        contentFit="cover"
      />
    );
  }

  return (
    <View
      style={[
        styles.placeholder,
        {
          width: size,
          height: size,
          borderRadius,
          experimental_backgroundImage: gradientFromSeed(seed).backgroundImage,
        },
      ]}>
      <Icon
        name={kind === 'playlist' ? 'playlist' : 'track'}
        size={Math.round(size * 0.4)}
        color="rgba(255,255,255,0.9)"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3F3F46',
    overflow: 'hidden',
  },
});
