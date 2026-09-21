import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import { Platform, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';

import { FollowButton } from '@/components/follow-button';
import { PlaylistCard } from '@/components/playlist-card';
import { PostCard } from '@/components/post-card';
import { ThemedText } from '@/components/themed-text';
import { TrackRow } from '@/components/track-row';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Icon } from '@/components/ui/icon';
import { Section } from '@/components/ui/section';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatCount } from '@/lib/format';
import { gradientFromSeed } from '@/lib/gradient';
import { usePlaylists, useTrack, useTracks } from '@/stores/catalog-store';
import { usePostIdsByAuthor } from '@/stores/feed-store';
import { useCurrentUserId } from '@/stores/session-store';
import { useFollowerCount, useFollowingCount, useUser } from '@/stores/users-store';
import type { User } from '@/types';

function withAlpha(hex: string, alpha: number) {
  const value = hex.replace('#', '');
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function fadeGradient(color: string) {
  return `linear-gradient(to bottom, ${withAlpha(color, 0.45)} 0%, ${withAlpha(color, 0)} 16%, ${withAlpha(color, 0)} 42%, ${withAlpha(color, 0.4)} 68%, ${withAlpha(color, 0.88)} 88%, ${color} 100%)`;
}

function HeroFade({ color, height }: { color: string; height: number }) {
  const fade = fadeGradient(color);

  if (Platform.OS === 'web') {
    return (
      <View pointerEvents="none" style={[styles.heroFade, { backgroundImage: fade } as object]} />
    );
  }

  const wash = `linear-gradient(to bottom, ${withAlpha(color, 0)}, ${color})`;

  return (
    <View pointerEvents="none" style={styles.heroFade}>
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: Math.round(height * 0.2),
          experimental_backgroundImage: `linear-gradient(to bottom, ${withAlpha(color, 0.4)}, ${withAlpha(color, 0)})`,
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: Math.round(height * 0.58),
          experimental_backgroundImage: wash,
        }}
      />
    </View>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <ThemedText type="defaultBold">{value}</ThemedText>
      <ThemedText type="tiny" themeColor="textSecondary">
        {label}
      </ThemedText>
    </View>
  );
}

function ProfileHero({
  user,
  width,
  height,
  topInset,
  headerAction,
  subtitle,
}: {
  user: User;
  width: number;
  height: number;
  topInset: number;
  headerAction?: ReactNode;
  subtitle?: string;
}) {
  const theme = useTheme();
  const photoUrl = user.avatarUrl.trim();
  const [photoFailed, setPhotoFailed] = useState(false);
  const showPhoto = Boolean(photoUrl) && !photoFailed;

  useEffect(() => {
    setPhotoFailed(false);
  }, [photoUrl]);
  const wash = gradientFromSeed(user.id, 168).backgroundImage;

  return (
    <View collapsable={false} style={[styles.hero, { width, height, backgroundColor: theme.background }]}>
      {showPhoto ? (
        <Image
          source={{ uri: photoUrl }}
          style={{ width, height, backgroundColor: theme.backgroundElement }}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={0}
          recyclingKey={photoUrl}
          accessibilityLabel={`${user.displayName}'s profile photo`}
          onError={() => setPhotoFailed(true)}
        />
      ) : (
        <View
          style={[
            { width, height, backgroundColor: user.accentColor },
            { experimental_backgroundImage: wash },
            Platform.OS === 'web' ? ({ backgroundImage: wash } as object) : null,
          ]}
        />
      )}

      {showPhoto && Platform.OS === 'web' ? (
        <Image
          source={{ uri: photoUrl }}
          style={[
            styles.heroBlur,
            {
              width,
              height: Math.round(height * 0.48),
              maskImage: 'linear-gradient(to top, #000 20%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to top, #000 20%, transparent 100%)',
            } as object,
          ]}
          contentFit="cover"
          contentPosition="bottom"
          blurRadius={28}
          cachePolicy="memory-disk"
        />
      ) : null}

      <HeroFade color={theme.background} height={height} />

      {headerAction || subtitle ? (
        <View style={[styles.heroChrome, { paddingTop: topInset + Spacing.two }]}>
          <View style={styles.heroChromeSide}>
            {subtitle ? (
              <ThemedText type="tiny" themeColor="textSecondary">
                {subtitle}
              </ThemedText>
            ) : null}
          </View>
          {headerAction}
        </View>
      ) : null}

      <View style={styles.heroIdentity}>
        <ThemedText type="heading" style={styles.heroName}>
          {user.displayName}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          @{user.handle}
        </ThemedText>
      </View>
    </View>
  );
}

export type ProfileViewProps = {
  userId: string;
  bottomInset?: number;
  topInset?: number;
  headerAction?: ReactNode;
  subtitle?: string;
};

export function ProfileView({
  userId,
  bottomInset = 0,
  topInset = 0,
  headerAction,
  subtitle,
}: ProfileViewProps) {
  const theme = useTheme();
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  const user = useUser(userId);
  const currentUserId = useCurrentUserId();
  const isMe = userId === currentUserId;

  const followers = useFollowerCount(userId);
  const following = useFollowingCount();
  const postIds = usePostIdsByAuthor(userId);
  const anthem = useTrack(user?.anthemTrackId);
  const topTracks = useTracks(user?.topTrackIds ?? []);
  const playlists = usePlaylists(user?.playlistIds ?? []);

  const heroHeight = Math.round(Math.max(260, Math.min(width, height * 0.46, 420)));

  if (!user) {
    return <EmptyState icon="profile" title="Profile not found" />;
  }

  return (
    <ScrollView
      contentContainerStyle={[styles.content, { paddingBottom: bottomInset + Spacing.five }]}
      showsVerticalScrollIndicator={false}>
      <ProfileHero
        user={user}
        width={width}
        height={heroHeight}
        topInset={topInset}
        headerAction={headerAction}
        subtitle={subtitle}
      />

      <View style={styles.identity}>
        {user.bio ? <ThemedText type="small">{user.bio}</ThemedText> : null}

        <View style={styles.statsRow}>
          <Stat value={formatCount(followers)} label="followers" />
          {isMe ? <Stat value={formatCount(following)} label="following" /> : null}
          <Stat value={formatCount(postIds.length)} label="posts" />
          <View style={styles.spacer} />

          {isMe ? (
            <Button
              label="Edit profile"
              icon="edit"
              variant="secondary"
              size="small"
              onPress={() => router.push('/edit-profile')}
            />
          ) : (
            <FollowButton userId={userId} accentColor={user.accentColor} />
          )}
        </View>

        {user.spotifyConnected ? (
          <View style={styles.spotifyBadge}>
            <Icon name="headphones" size={14} color={theme.accent} />
            <ThemedText type="tiny" style={{ color: theme.accent }}>
              Spotify connected
            </ThemedText>
          </View>
        ) : null}
      </View>

      {anthem ? (
        <Section title="Anthem">
          <View style={styles.sectionBody}>
            <View
              style={[
                styles.anthem,
                { backgroundColor: theme.backgroundElement, borderColor: user.accentColor },
              ]}>
              <TrackRow
                track={anthem}
                right={<Icon name="pin" size={16} color={user.accentColor} />}
              />
            </View>
          </View>
        </Section>
      ) : null}

      {topTracks.length > 0 ? (
        <Section title="On repeat">
          <View style={styles.sectionBody}>
            {topTracks.map((track, index) => (
              <TrackRow key={track.id} track={track} rank={index + 1} />
            ))}
          </View>
        </Section>
      ) : null}

      {playlists.length > 0 ? (
        <Section title="Playlists">
          <View style={styles.sectionBody}>
            {playlists.map((playlist) => (
              <PlaylistCard key={playlist.id} playlist={playlist} />
            ))}
          </View>
        </Section>
      ) : null}

      <Section title="Posts">
        {postIds.length === 0 ? (
          <EmptyState
            icon="compose"
            title={isMe ? 'You haven’t shared anything yet' : 'No posts yet'}
            description={isMe ? 'Share a song or playlist to start your profile.' : undefined}
            action={
              isMe ? (
                <Button label="Share something" size="small" onPress={() => router.push('/compose')} />
              ) : undefined
            }
          />
        ) : (
          <View>
            {postIds.map((postId) => (
              <PostCard key={postId} postId={postId} />
            ))}
          </View>
        )}
      </Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.four,
  },
  hero: {
    overflow: 'hidden',
  },
  heroBlur: {
    position: 'absolute',
    left: 0,
    bottom: 0,
  },
  heroFade: {
    ...StyleSheet.absoluteFillObject,
  },
  heroChrome: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    gap: Spacing.three,
  },
  heroChromeSide: {
    flex: 1,
  },
  heroIdentity: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.two,
    gap: Spacing.half,
  },
  heroName: {
    textShadowColor: 'rgba(0, 0, 0, 0.55)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 10,
  },
  identity: {
    paddingHorizontal: Spacing.three,
    marginTop: -Spacing.two,
    gap: Spacing.two,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
    paddingTop: Spacing.one,
  },
  stat: {
    gap: Spacing.half,
  },
  spacer: {
    flex: 1,
  },
  spotifyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  sectionBody: {
    paddingHorizontal: Spacing.two,
  },
  anthem: {
    borderRadius: Radius.medium,
    borderWidth: 1,
    padding: Spacing.one,
  },
});
