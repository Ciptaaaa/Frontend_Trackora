import type { User } from '../../types/domain';

interface AvatarProps {
  user: User;
  size?: 'xs' | 'sm';
  tone?: 'default' | 'inverse';
}
const TINTS = [
  'bg-petrol-600',
  'bg-saffron-600',
  'bg-berry-500',
  'bg-petrol-400',
] as const;

function initialsOf(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter((part) => part.length > 0);
  const first = parts[0]?.charAt(0) ?? '?';
  const last = parts.length > 1 ? parts[parts.length - 1] : undefined;
  return (first + (last?.charAt(0) ?? '')).toUpperCase();
}

function tintFor(publicId: string): string {
  let sum = 0;
  for (const char of publicId) sum += char.charCodeAt(0);
  return TINTS[sum % TINTS.length] ?? TINTS[0];
}

export default function Avatar({ user, size = 'xs', tone = 'default' }: AvatarProps) {
  const sizeClass = size === 'xs' ? 'size-6 text-[10px]' : 'size-8 text-xs';
  const ringClass = tone === 'inverse' ? 'ring-nav-surface' : 'ring-paper-50';

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-semibold text-onaccent ring-2 ${ringClass} ${sizeClass} ${tintFor(user.public_id)}`}
      title={user.name}
    >
      <span aria-hidden="true">{initialsOf(user.name)}</span>
      <span className="sr-only">{user.name}</span>
    </span>
  );
}
