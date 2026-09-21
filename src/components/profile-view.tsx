import { useRouter } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import { Image as RNImage, ImageBackground, Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  type SharedValue,
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

const heroBlend = require('../../assets/images/hero-blend.png');

function withAlpha(hex: string, alpha: number) {
  const value = hex.replace('#', '');
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function photoMaskGradient() {
  return 'linear-gradient(to bottom, transparent 0%, #000 16%, #000 52%, transparent 100%)';
}

function heroBlendCss(color: string) {
  const clear = withAlpha(color, 0);
  return `linear-gradient(to bottom, ${color} 0%, ${withAlpha(color, 0.55)} 10%, ${clear} 26%, ${clear} 48%, ${withAlpha(color, 0.28)} 66%, ${withAlpha(color, 0.7)} 84%, ${color} 100%)`;
}

function HeroFade({ color }: { color: string }) {
  const css = heroBlendCss(color);

  return (
    <View
      pointerEvents="none"
      collapsable={false}
      style={[
        styles.heroFade,
        { experimental_backgroundImage: css },
        Platform.OS === 'web' ? ({ backgroundImage: css } as object) : null,
      ]}
    />
  );
}

function PhotoBlendOverlay({ width, height }: { width: number; height: number }) {
  return (
    <View
      pointerEvents="none"
      collapsable={false}
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width,
        height,
        zIndex: 8,
        elevation: 8,
      }}>
      <RNImage source={heroBlend} resizeMode="stretch" style={{ width, height }} />
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
  const photoHeight = maxHeight + extra;

  useEffect(() => {
    setPhotoFailed(false);
  }, [photoUrl]);

  const wash = gradientFromSeed(user.id, 168).backgroundImage;

  const photoMotion = useAnimatedStyle(() => {
    const shift = interpolate(scrollY.value, [0, maxHeight], [0, extra], Extrapolation.CLAMP);
    const blurPx = interpolate(scrollY.value, [0, blurDistance], [0, 16], Extrapolation.CLAMP);

    if (Platform.OS === 'web') {
      return {
        top: shift,
        filter: `blur(${blurPx}px)`,
      };
    }

    return {
      top: shift,
    };
  });

  return (
    <View
      collapsable={false}
      style={[
        styles.hero,
        {
          width,
          height: maxHeight,
          backgroundColor: theme.background,
          marginBottom: -Spacing.four,
        },
      ]}>
      <View
        collapsable={false}
        style={[
          styles.heroPhotoLayer,
          Platform.OS === 'web' ? ({ opacity: 0.999, isolation: 'isolate' } as object) : null,
        ]}>
        {showPhoto ? (
          Platform.OS === 'web' ? (
            <Animated.View
              pointerEvents="none"
              style={[
                {
                  position: 'absolute',
                  left: 0,
                  width,
                  height: photoHeight,
                  backgroundImage: `url(${JSON.stringify(photoUrl)})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  maskImage: photoMaskGradient(),
                  WebkitMaskImage: photoMaskGradient(),
                } as object,
                photoMotion,
              ]}
            />
          ) : (
            <View collapsable={false} style={{ width, height: maxHeight, overflow: 'hidden' }}>
              <ImageBackground
                pointerEvents="none"
                source={{ uri: photoUrl }}
                resizeMode="cover"
                accessibilityLabel={`${user.displayName}'s profile photo`}
                onError={() => setPhotoFailed(true)}
                style={{ width, height: maxHeight }}
                imageStyle={{ width, height: photoHeight, elevation: 0 }}>
                <RNImage
                  pointerEvents="none"
                  source={heroBlend}
                  resizeMode="stretch"
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width,
                    height: maxHeight,
                    zIndex: 2,
                    elevation: 6,
                  }}
                />
              </ImageBackground>
            </View>
          )
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
      </View>

      {showPhoto && Platform.OS !== 'web' ? (
        <PhotoBlendOverlay width={width} height={maxHeight} />
      ) : null}
      <HeroFade color={theme.background} />

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
  heroPhotoLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
    elevation: 0,
  },
  heroFade: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
    elevation: 2,
  },
  stickyChrome: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 4,
    paddingHorizontal: Spacing.three,
  },
  heroChrome: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 3,
    paddingHorizontal: Spacing.three,
  },
  heroIdentity: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 12,
    elevation: 12,
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
