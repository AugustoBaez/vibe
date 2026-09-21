/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#09090B',
    background: '#FFFFFF',
    backgroundElement: '#F4F4F5',
    backgroundSelected: '#E4E4E7',
    textSecondary: '#52525B',
    border: '#E4E4E7',
    accent: '#16A34A',
    like: '#E11D48',
  },
  dark: {
    text: '#FAFAFA',
    background: '#101010',
    backgroundElement: '#1C1C1C',
    backgroundSelected: '#2A2A2A',
    textSecondary: '#A1A1AA',
    border: '#242424',
    accent: '#1DB954',
    like: '#FB7185',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/** Fallback accent used before a user picks their own profile color. */
export const DefaultAccent = '#1DB954';

/** Accent colors a user can pick from when customizing their profile. */
export const AccentPalette = [
  '#1DB954',
  '#7C3AED',
  '#EC4899',
  '#F97316',
  '#FACC15',
  '#06B6D4',
  '#3B82F6',
  '#EF4444',
] as const;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  small: 6,
  medium: 12,
  large: 20,
  pill: 999,
} as const;

export const BottomTabInset = 108;
export const MaxContentWidth = 800;
