import { Button } from '@/components/ui/button';
import { useIsFollowing, useUsersStore } from '@/stores/users-store';

export type FollowButtonProps = {
  userId: string;
  size?: 'small' | 'medium';
  stretch?: boolean;
  accentColor?: string;
};

export function FollowButton({ userId, size = 'small', stretch, accentColor }: FollowButtonProps) {
  const isFollowing = useIsFollowing(userId);
  const toggleFollow = useUsersStore((state) => state.toggleFollow);

  return (
    <Button
      label={isFollowing ? 'Following' : 'Add'}
      icon={isFollowing ? 'check' : 'addPerson'}
      variant={isFollowing ? 'ghost' : 'primary'}
      size={size}
      stretch={stretch}
      accentColor={accentColor}
      onPress={() => toggleFollow(userId)}
    />
  );
}
