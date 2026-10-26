import { useRef, useState, type ReactNode } from 'react';
import Avatar from '../atoms/Avatar';
import Icon from '../atoms/Icon';
import ThemeToggle from '../molecules/ThemeToggle';
import LocaleSegmented from '../molecules/LocaleSegmented';
import { useLocale } from '../../i18n/LocaleContext';
import { useDismissable } from '../../lib/useDismissable';
import type { ThemePreference } from '../../lib/theme';
import type { User } from '../../types/domain';

type Placement = 'up' | 'down';
type Align = 'start' | 'end';

interface AccountMenuProps {
  user: User;
  theme: ThemePreference;
  placement: Placement;
  align: Align;
  tone?: 'default' | 'inverse';
  children?: ReactNode;
  triggerClassName?: string;
  onThemeChange: (preference: ThemePreference) => void;
  onOpenSettings: () => void;
  onLogout: () => void;
}
export default function AccountMenu({
  user,
  theme,
  placement,
  align,
  tone = 'default',
  children,
  triggerClassName = 'rounded-lg p-0.5',
  onThemeChange,
  onOpenSettings,
  onLogout,
}: AccountMenuProps) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useDismissable(open, rootRef, () => setOpen(false));
  const position = `${placement === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'} ${
    align === 'end' ? 'right-0' : 'left-0'
  }`;

  const triggerTone =
    tone === 'inverse'
      ? 'hover:bg-nav-raised text-nav-muted'
      : 'hover:bg-paper-200 text-ink-400';

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={t('account.open', { name: user.name })}
        title={t('account.open', { name: user.name })}
        className={`flex items-center gap-2.5 transition-colors ${triggerTone} ${triggerClassName}`}
      >
        {children ?? <Avatar user={user} size="sm" tone={tone} />}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={t('account.menu')}
          className={`absolute z-50 max-h-[min(26rem,calc(100dvh-6rem))] w-72 overflow-y-auto rounded-xl bg-paper-50 shadow-xl ring-1 ring-paper-300 scrollbar-slim dark:ring-paper-400 ${position}`}
        >
          <div className="flex items-center gap-3 border-b border-paper-300 bg-paper-100 px-4 py-3.5">
            <Avatar user={user} size="md" />
            <span className="min-w-0 flex-1">
              <span className="block text-[11px] font-medium text-ink-400">
                {t('account.signedInAs')}
              </span>
              <span className="block truncate text-sm font-semibold text-ink-900">
                {user.name}
              </span>
              <span className="block truncate text-xs text-ink-400">
                {user.email}
              </span>
            </span>
          </div>

          <div className="p-1.5">
            <button
              type="button"
              onClick={() => {
                onOpenSettings();
                setOpen(false);
              }}
              className="group flex min-h-11 w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-paper-100"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-paper-200/70 text-ink-600 transition-colors group-hover:bg-paper-50">
                <Icon name="settings" className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-ink-800">
                  {t('account.settings')}
                </span>
                <span className="block text-[11px] leading-relaxed text-ink-400">
                  {t('account.settingsHint')}
                </span>
              </span>
              <Icon name="chevron-right" className="size-4 shrink-0 text-ink-400" />
            </button>
          </div>

          <div className="space-y-2.5 border-t border-paper-300 px-3.5 py-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-ink-600">
                {t('theme.label')}
              </span>
              <ThemeToggle preference={theme} onChange={onThemeChange} />
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-ink-600">
                {t('locale.label')}
              </span>
              <LocaleSegmented />
            </div>
          </div>

          <div className="border-t border-paper-300 p-1.5">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
              className="flex min-h-11 w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm font-medium text-berry-500 transition-colors hover:bg-berry-100 hover:text-berry-700"
            >
              <Icon name="logout" className="size-4 shrink-0" />
              {t('nav.logout')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
