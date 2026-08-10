import Avatar from '../atoms/Avatar';
import type { User } from '../../types/domain';

interface AvatarGroupProps {
  users: User[];
  max?: number;
}

export default function AvatarGroup({ users, max = 3 }: AvatarGroupProps) {
  if (users.length === 0) return null;

  const shown = users.slice(0, max);
  const overflow = users.length - shown.length;

  return (
    <span className="flex items-center -space-x-1.5">
      {shown.map((user) => (
        <Avatar key={user.public_id} user={user} />
      ))}
      {overflow > 0 && (
        <span className="inline-flex size-6 items-center justify-center rounded-full bg-paper-300 text-[10px] font-semibold text-ink-600 ring-2 ring-paper-50">
          +{overflow}
        </span>
      )}
    </span>
  );
}
