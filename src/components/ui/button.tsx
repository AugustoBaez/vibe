import { ActivityIndicator, Pressable, StyleSheet, type PressableProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Icon, type IconName } from '@/components/ui/icon';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'small' | 'medium';
  icon?: IconName;
  loading?: boolean;
  /** Overrides the primary background, used for per-profile accent colors. */
  accentColor?: string;
  stretch?: boolean;
};

export function Button({
  label,
  variant = 'primary',
  size = 'medium',
  icon,
  loading = false,
  accentColor,
  stretch = false,
  disabled,
  ...rest
}: ButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  const background =
    variant === 'primary'
      ? accentColor ?? theme.accent
      : variant === 'secondary'
        ? theme.backgroundElement
        : 'transparent';

  const foreground = variant === 'primary' ? '#FFFFFF' : theme.text;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        size === 'small' ? styles.small : styles.medium,
        stretch && styles.stretch,
        { backgroundColor: background },
        variant === 'ghost' && { borderWidth: 1, borderColor: theme.border },
        pressed && styles.pressed,
        isDisabled && styles.disabled,
      ]}
      {...rest}>
      {loading ? (
        <ActivityIndicator color={foreground} size="small" />
      ) : (
        <>
          {icon ? <Icon name={icon} size={size === 'small' ? 14 : 18} color={foreground} /> : null}
          <ThemedText type={size === 'small' ? 'smallBold' : 'defaultBold'} style={{ color: foreground }}>
            {label}
          </ThemedText>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    borderRadius: Radius.pill,
  },
  small: {
    paddingVertical: Spacing.one + 2,
    paddingHorizontal: Spacing.three,
    minHeight: 32,
  },
  medium: {
    paddingVertical: Spacing.two + 2,
    paddingHorizontal: Spacing.four,
    minHeight: 48,
  },
  stretch: {
    alignSelf: 'stretch',
  },
  pressed: {
    opacity: 0.75,
  },
  disabled: {
    opacity: 0.45,
  },
});
