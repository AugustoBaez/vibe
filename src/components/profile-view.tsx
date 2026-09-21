import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedProps,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

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
  return `linear-gradient(to bottom, ${color} 0%, ${withAlpha(color, 0.7)} 8%, ${withAlpha(color, 0.28)} 16%, ${withAlpha(color, 0)} 30%, ${withAlpha(color, 0)} 58%, ${withAlpha(color, 0.4)} 78%, ${withAlpha(color, 0.88)} 92%, ${color} 100%)`;
}

function HeroFade({
  color,
  height,
  topInset,
}: {
  color: string;
  height: number;
  topInset: number;
}) {
  const fade = fadeGradient(color);

  if (Platform.OS === 'web') {
    return (
      <View pointerEvents="none" style={[styles.heroFade, { backgroundImage: fade } as object]} />
    );
  }

  const topBand = Math.round(Math.max(topInset + 28, height * 0.24));
  const bottomBand = Math.round(height * 0.42);
  const topSteps = 10;
  const bottomSteps = 8;

  return (
    <View pointerEvents="none" style={styles.heroFade}>
      <View style={{ height: topBand }}>
        {Array.from({ length: topSteps }, (_, index) => (
          <View
            key={`top-${index}`}
            style={{
              flex: 1,
              backgroundColor: color,
              opacity: ((topSteps - index) / topSteps) ** 1.35,
            }}
          />
        ))}
      </View>
      <View style={{ flex: 1 }} />
      <View style={{ height: bottomBand }}>
        {Array.from({ length: bottomSteps }, (_, index) => {
          const t = (index + 1) / bottomSteps;
          return (
            <View
              key={`bottom-${index}`}
              style={{ flex: 1, backgroundColor: color, opacity: t * t }}
            />
          );
        })}
      </View>
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

const AnimatedImage = Animated.createAnimatedComponent(Image);

function ProfileHero({
  user,
  width,
  maxHeight,
  topInset,
  subtitle,
  scrollY,
  blurDistance,
}: {
  user: User;
  width: number;
  maxHeight: number;
  topInset: number;
  subtitle?: string;
  scrollY: SharedValue<number>;
  blurDistance: number;
}) {
  const theme = useTheme();
  const photoUrl = user.avatarUrl.trim();
  const [photoFailed, setPhotoFailed] = useState(false);
  const showPhoto = Boolean(photoUrl) && !photoFailed;
  const extra = Math.round(maxHeight * 0.28);

  useEffect(() => {
    setPhotoFailed(false);
  }, [photoUrl]);

  const wash = gradientFromSeed(user.id, 168).backgroundImage;

  const photoMotion = useAnimatedStyle(() => {
    const shift = interpolate(scrollY.value, [0, maxHeight], [0, extra], Extrapolation.CLAMP);
    const blurPx = interpolate(scrollY.value, [0, blurDistance], [0, 18], Extrapolation.CLAMP);

    if (Platform.OS === 'web') {
      return {
        transform: [{ translateY: shift }],
        filter: `blur(${blurPx}px)`,
      };
    }

    return {
      transform: [{ translateY: shift }],
    };
  });

  const blurProps = useAnimatedProps(() => ({
    blurRadius: interpolate(scrollY.value, [0, blurDistance], [0, 16], Extrapolation.CLAMP),
  }));

  return (
    <View collapsable={false} style={[styles.hero, { width, height: maxHeight }]}>
      {showPhoto ? (
        <Animated.View style={[{ width, height: maxHeight + extra }, photoMotion]}>
          <AnimatedImage
            pointerEvents="none"
            source={{ uri: photoUrl }}
            style={{ width, height: maxHeight + extra }}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={0}
            recyclingKey={photoUrl}
            accessibilityLabel={`${user.displayName}'s profile photo`}
            onError={() => setPhotoFailed(true)}
            animatedProps={Platform.OS === 'web' ? undefined : blurProps}
          />
        </Animated.View>
      ) : (
        <View
          pointerEvents="none"
          style={[
            { width, height: maxHeight, backgroundColor: user.accentColor },
            { experimental_backgroundImage: wash },
            Platform.OS === 'web' ? ({ backgroundImage: wash } as object) : null,
          ]}
        />
      )}

      <HeroFade color={theme.background} height={maxHeight} topInset={topInset} />

      {subtitle ? (
        <View pointerEvents="none" style={[styles.heroChrome, { paddingTop: topInset + Spacing.two }]}>
          <ThemedText type="tiny" themeColor="textSecondary">
            {subtitle}
          </ThemedText>
        </View>
      ) : null}

      <View pointerEvents="none" style={styles.heroIdentity}>
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
  const scrollY = useSharedValue(0);

  const user = useUser(userId);
  const currentUserId = useCurrentUserId();
  const isMe = userId === currentUserId;

  const followers = useFollowerCount(userId);
  const following = useFollowingCount();
  const postIds = usePostIdsByAuthor(userId);
  const anthem = useTrack(user?.anthemTrackId);
  const topTracks = useTracks(user?.topTrackIds ?? []);
  const playlists = usePlaylists(user?.playlistIds ?? []);

  const maxHeroHeight = Math.round(Math.max(260, Math.min(width, height * 0.46, 420)));
  const blurDistance = Math.round(height * 0.4);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  if (!user) {
    return <EmptyState icon="profile" title="Profile not found" />;
  }

  return (
    <View style={styles.screen}>
      <Animated.ScrollView
        style={styles.screen}
        contentContainerStyle={[styles.content, { paddingBottom: bottomInset + Spacing.five }]}
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}>
        <ProfileHero
          user={user}
          width={width}
          maxHeight={maxHeroHeight}
          topInset={topInset}
          subtitle={subtitle}
          scrollY={scrollY}
          blurDistance={blurDistance}
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
      </Animated.ScrollView>

      {headerAction ? (
        <View pointerEvents="box-none" style={[styles.stickyChrome, { paddingTop: topInset + Spacing.two }]}>
          {headerAction}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    gap: Spacing.four,
  },
  hero: {
    overflow: 'hidden',
  },
  heroFade: {
    ...StyleSheet.absoluteFillObject,
  },
  stickyChrome: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 3,
    paddingHorizontal: Spacing.three,
  },
  heroChrome: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.three,
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
