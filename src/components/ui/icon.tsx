import type { AndroidSymbol } from 'expo-symbols';
import { SymbolView } from 'expo-symbols';
import type { ColorValue, StyleProp, ViewStyle } from 'react-native';
import type { SFSymbol } from 'sf-symbols-typescript';

/**
 * One name per concept, mapped to SF Symbols on iOS and Material Symbols
 * elsewhere, so screens never deal with platform-specific icon names.
 */
const icons = {
  home: { ios: 'house', android: 'home', web: 'home' },
  homeSelected: { ios: 'house.fill', android: 'home', web: 'home' },
  search: { ios: 'magnifyingglass', android: 'search', web: 'search' },
  profile: { ios: 'person', android: 'person', web: 'person' },
  profileSelected: { ios: 'person.fill', android: 'person', web: 'person' },
  like: { ios: 'heart', android: 'favorite', web: 'favorite' },
  liked: { ios: 'heart.fill', android: 'favorite', web: 'favorite' },
  comment: { ios: 'bubble.right', android: 'chat_bubble', web: 'chat_bubble' },
  add: { ios: 'plus', android: 'add', web: 'add' },
  back: { ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' },
  compose: { ios: 'plus.circle.fill', android: 'add_circle', web: 'add_circle' },
  addPerson: { ios: 'person.badge.plus', android: 'person_add', web: 'person_add' },
  check: { ios: 'checkmark', android: 'check', web: 'check' },
  close: { ios: 'xmark', android: 'close', web: 'close' },
  edit: { ios: 'pencil', android: 'edit', web: 'edit' },
  pin: { ios: 'pin.fill', android: 'push_pin', web: 'push_pin' },
  track: { ios: 'music.note', android: 'music_note', web: 'music_note' },
  playlist: { ios: 'music.note.list', android: 'queue_music', web: 'queue_music' },
  play: { ios: 'play.fill', android: 'play_arrow', web: 'play_arrow' },
  pause: { ios: 'pause.fill', android: 'pause', web: 'pause' },
  external: { ios: 'arrow.up.right.square', android: 'open_in_new', web: 'open_in_new' },
  send: { ios: 'arrow.up.circle.fill', android: 'send', web: 'send' },
  signOut: { ios: 'rectangle.portrait.and.arrow.right', android: 'logout', web: 'logout' },
  stats: { ios: 'chart.bar.fill', android: 'equalizer', web: 'equalizer' },
  headphones: { ios: 'headphones', android: 'headphones', web: 'headphones' },
} as const satisfies Record<string, { ios: SFSymbol; android: AndroidSymbol; web: AndroidSymbol }>;

export type IconName = keyof typeof icons;

export type IconProps = {
  name: IconName;
  size?: number;
  color?: ColorValue;
  style?: StyleProp<ViewStyle>;
};

export function Icon({ name, size = 20, color, style }: IconProps) {
  return (
    <SymbolView
      name={icons[name]}
      size={size}
      tintColor={color}
      style={[{ width: size, height: size }, style]}
    />
  );
}
