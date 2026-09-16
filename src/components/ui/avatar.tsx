import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius } from '@/constants/theme';
import { initialsOf } from '@/lib/format';
import { gradientFromSeed } from '@/lib/gradient';
import type { User } from '@/types';

export type AvatarProps = {
  user: Pick<User, 'id' | 'displayName' | 'avatarUrl' | 'accentColor'>;
  size?: number;
  /** Ring color, used to highlight the profile owner. */
  ring?: string;
};

export function Avatar({ user, size = 44, ring }: AvatarProps) {
  const gradient = gradientFromSeed(user.id);
  const ringStyle = ring ? { borderWidth: 2, borderColor: ring } : null;

  if (user.avatarUrl) {
    return (
      <Image
        source={{ uri: user.avatarUrl }}
        style={[{ width: size, height: size, borderRadius: Radius.pill }, ringStyle]}
        contentFit="cover"
      />
    );
  }

  return (
    <View
      style={[
        styles.fallback,
        {
          width: size,
          height: size,
          borderRadius: Radius.pill,
          backgroundColor: user.accentColor,
          experimental_backgroundImage: gradient.backgroundImage,
        },
        ringStyle,
      ]}>
      <ThemedText
        style={[styles.initials, { fontSize: size * 0.38, lineHeight: size * 0.44 }]}
        numberOfLines={1}>
        {initialsOf(user.displayName)}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  initials: {
    color: '#FFFFFF',
    fontWeight: 700,
  },
});
