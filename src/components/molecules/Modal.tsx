import { useEffect, type ReactNode } from 'react';
import IconButton from '../atoms/IconButton';
import { useT } from '../../i18n/LocaleContext';
import { lockBodyScroll } from '../../lib/scrollLock';

type ModalSize = 'sm' | 'md';

interface ModalProps {
  open: boolean;
  title: string;
  hint?: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  size?: ModalSize;
}

const WIDTHS: Record<ModalSize, string> = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-lg',
};

export default function Modal({
  open,
  title,
  hint,
  children,
  footer,
  onClose,
  size = 'md',
}: ModalProps) {
  const t = useT();

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', onKeyDown);
    const release = lockBodyScroll();

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      release();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-end justify-center sm:items-center sm:p-6">
      <div
        className="absolute inset-0 bg-scrim backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative flex max-h-[90dvh] w-full flex-col rounded-t-2xl bg-paper-50 shadow-2xl sm:max-h-[82dvh] sm:rounded-2xl ${WIDTHS[size]}`}
      >
        <span
          className="mx-auto mt-2 h-1 w-9 shrink-0 rounded-full bg-paper-300 sm:hidden"
          aria-hidden="true"
        />

        <header className="flex shrink-0 items-start gap-3 border-b border-paper-300/60 px-5 py-4">
          <div className="min-w-0 flex-1">
            <h2 className="truncate font-display text-base leading-snug font-semibold text-ink-900">
              {title}
            </h2>
            {hint !== undefined && (
              <p className="mt-0.5 text-xs leading-relaxed text-ink-400">{hint}</p>
            )}
          </div>
          <IconButton icon="close" label={t('common.close')} onClick={onClose} />
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 scrollbar-slim">
          {children}
        </div>

        {footer !== undefined && (
          <footer className="flex shrink-0 items-center justify-end gap-2 border-t border-paper-300/60 px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pb-3">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}
