import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'danger-ghost';
type ButtonSize = 'sm' | 'md';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-petrol-600 text-onaccent shadow-sm shadow-petrol-600/20 hover:bg-petrol-700 active:bg-petrol-700',
  secondary:
    'bg-petrol-50 text-petrol-700 ring-1 ring-petrol-200 ring-inset hover:bg-petrol-200/70 dark:ring-petrol-400/70',
  ghost: 'text-ink-600 hover:bg-paper-200 hover:text-ink-900',
  danger: 'bg-berry-500 text-onaccent hover:bg-berry-700',
  'danger-ghost':
    'text-berry-500 ring-1 ring-berry-500/25 ring-inset hover:bg-berry-100 hover:text-berry-700',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-9 gap-1.5 px-3 text-xs',
  md: 'h-10 gap-2 px-4 text-sm',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center rounded-lg font-medium transition-colors duration-150 max-sm:min-h-11 disabled:pointer-events-none disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
