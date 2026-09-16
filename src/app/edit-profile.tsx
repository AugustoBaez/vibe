import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TrackRow } from '@/components/track-row';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Section } from '@/components/ui/section';
import { TextField } from '@/components/ui/text-field';
import { AccentPalette, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useTracks } from '@/stores/catalog-store';
import { useCurrentUserId } from '@/stores/session-store';
import { useUser, useUsersStore } from '@/stores/users-store';

export default function EditProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const currentUserId = useCurrentUserId();
  const user = useUser(currentUserId);
  const updateProfile = useUsersStore((state) => state.updateProfile);

  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [accentColor, setAccentColor] = useState(user?.accentColor ?? AccentPalette[0]);
  const [anthemTrackId, setAnthemTrackId] = useState(user?.anthemTrackId ?? null);

  const anthemOptions = useTracks(user?.topTrackIds ?? []);

  if (!user) return null;

  function save() {
    updateProfile(currentUserId, {
      displayName: displayName.trim() || user!.displayName,
      bio: bio.trim(),
      accentColor,
      anthemTrackId,
    });

    router.back();
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.preview}>
          <Avatar
            user={{ ...user, displayName: displayName || user.displayName, accentColor }}
            size={72}
          />
          <View style={styles.previewMeta}>
            <ThemedText type="defaultBold">{displayName || user.displayName}</ThemedText>
            <ThemedText type="tiny" themeColor="textSecondary">
              @{user.handle}
            </ThemedText>
          </View>
        </View>

        <View style={styles.padded}>
          <TextField
            label="Display name"
            value={displayName}
            onChangeText={setDisplayName}
            maxLength={40}
          />
        </View>

        <View style={styles.padded}>
          <TextField
            label="Bio"
            value={bio}
            onChangeText={setBio}
            multiline
            maxLength={160}
            hint={`${bio.length}/160`}
          />
        </View>

        <Section title="Accent color">
          <View style={styles.swatches}>
            {AccentPalette.map((color) => (
              <Pressable
                key={color}
                accessibilityRole="button"
                accessibilityLabel={`Accent ${color}`}
                onPress={() => setAccentColor(color)}
                style={({ pressed }) => [
                  styles.swatch,
                  { backgroundColor: color },
                  accentColor === color && { borderColor: theme.text, borderWidth: 3 },
                  pressed && styles.pressed,
                ]}>
                {accentColor === color ? <Icon name="check" size={16} color="#FFFFFF" /> : null}
              </Pressable>
            ))}
          </View>
        </Section>

        <Section title="Anthem">
          <View style={styles.sectionBody}>
            {anthemOptions.map((track) => (
              <TrackRow
                key={track.id}
                track={track}
                selected={anthemTrackId === track.id}
                onPress={() => setAnthemTrackId(anthemTrackId === track.id ? null : track.id)}
                right={
                  anthemTrackId === track.id ? (
                    <Icon name="pin" size={16} color={accentColor} />
                  ) : undefined
                }
              />
            ))}
          </View>
        </Section>
      </ScrollView>

      <View
        style={[
          styles.footer,
          { borderTopColor: theme.border, paddingBottom: Math.max(insets.bottom, Spacing.three) },
        ]}>
        <Button label="Save profile" accentColor={accentColor} onPress={save} stretch />
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
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
  previewMeta: {
    gap: Spacing.half,
  },
  padded: {
    paddingHorizontal: Spacing.three,
  },
  swatches: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  swatch: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionBody: {
    paddingHorizontal: Spacing.two,
  },
  footer: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  pressed: {
    opacity: 0.7,
  },
});
