import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export const LikeColor = '#FF0038';

export function LikeButton({
  liked,
  count,
  onPress,
}: {
  liked: boolean;
  count: number;
  onPress: () => void;
}) {
  const theme = useTheme();
  const scale = useSharedValue(1);

  const heartMotion = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  function handlePress() {
    const nextLiked = !liked;
    scale.value = nextLiked
      ? withSequence(
          withTiming(1.22, { duration: 90 }),
          withSpring(1, { damping: 10, stiffness: 420, mass: 0.5 })
        )
      : withSequence(
          withTiming(0.88, { duration: 80 }),
          withSpring(1, { damping: 12, stiffness: 320 })
        );
    onPress();
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={liked ? 'Unlike' : 'Like'}
      hitSlop={8}
      onPress={(event) => {
        event.stopPropagation();
        handlePress();
      }}
      style={styles.action}>
      <Animated.View style={heartMotion}>
        <MaterialIcons
          name={liked ? 'favorite' : 'favorite-border'}
          size={18}
          color={liked ? LikeColor : theme.textSecondary}
        />
      </Animated.View>
      <ThemedText type="small" style={{ color: liked ? LikeColor : theme.textSecondary }}>
        {count}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one + 2,
    paddingVertical: Spacing.one,
    minWidth: 44,
  },
});
