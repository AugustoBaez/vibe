import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { FollowButton } from '@/components/follow-button';
import { PlaylistCard } from '@/components/playlist-card';
import { PostCard } from '@/components/post-card';
import { ThemedText } from '@/components/themed-text';
import { TrackRow } from '@/components/track-row';
import { Avatar } from '@/components/ui/avatar';
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

export type ProfileViewProps = {
  userId: string;
  bottomInset?: number;
};

export function ProfileView({ userId, bottomInset = 0 }: ProfileViewProps) {
  const theme = useTheme();
  const router = useRouter();

  const user = useUser(userId);
  const currentUserId = useCurrentUserId();
  const isMe = userId === currentUserId;

  const followers = useFollowerCount(userId);
  const following = useFollowingCount();
  const postIds = usePostIdsByAuthor(userId);
  const anthem = useTrack(user?.anthemTrackId);
  const topTracks = useTracks(user?.topTrackIds ?? []);
  const playlists = usePlaylists(user?.playlistIds ?? []);

  if (!user) {
    return <EmptyState icon="profile" title="Profile not found" />;
  }

  return (
    <ScrollView
      contentContainerStyle={[styles.content, { paddingBottom: bottomInset + Spacing.five }]}
      showsVerticalScrollIndicator={false}>
      <View
        style={[
          styles.banner,
          {
            backgroundColor: user.accentColor,
            experimental_backgroundImage: gradientFromSeed(user.id, 160).backgroundImage,
          },
        ]}
      />

      <View style={styles.identity}>
        <Avatar user={user} size={84} ring={theme.background} />

        <View style={styles.nameBlock}>
          <ThemedText type="heading">{user.displayName}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            @{user.handle}
          </ThemedText>
        </View>

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
  banner: {
    height: 120,
  },
  identity: {
    paddingHorizontal: Spacing.three,
    marginTop: -42,
    gap: Spacing.two,
  },
  nameBlock: {
    gap: Spacing.half,
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
