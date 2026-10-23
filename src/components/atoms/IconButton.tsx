import type { ButtonHTMLAttributes } from 'react';
import Icon, { type IconName } from './Icon';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconName;
  label: string;
  tone?: 'default' | 'inverse';
}

export default function IconButton({
  icon,
  label,
  tone = 'default',
  className = '',
  ...rest
}: IconButtonProps) {
  const toneClass =
    tone === 'inverse'
      ? 'text-nav-muted hover:bg-nav-raised hover:text-nav-text'
      : 'text-ink-400 hover:bg-paper-200 hover:text-ink-900';

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`inline-flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-150 max-md:min-h-11 max-md:min-w-11 ${toneClass} ${className}`}
      {...rest}
    >
      <Icon name={icon} />
    </button>
  );
}
