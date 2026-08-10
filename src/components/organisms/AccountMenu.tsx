import { useRef, useState, type ReactNode } from 'react';
import Avatar from '../atoms/Avatar';
import Icon from '../atoms/Icon';
import ThemeToggle from '../molecules/ThemeToggle';
import { LOCALES } from '../../i18n';
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
  const { locale, t, setLocale } = useLocale();
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
        aria-haspopup="menu"
        aria-label={t('account.open', { name: user.name })}
        title={t('account.open', { name: user.name })}
        className={`flex items-center gap-2.5 transition-colors ${triggerTone} ${triggerClassName}`}
      >
        {children ?? <Avatar user={user} size="sm" tone={tone} />}
      </button>

      {open && (
        <div
          role="menu"
          aria-label={t('account.menu')}
          className={`absolute z-50 w-64 overflow-hidden rounded-xl bg-paper-50 shadow-lg ring-1 ring-paper-300 ${position}`}
        >
          <div className="flex items-center gap-2.5 border-b border-paper-300/60 px-3 py-3">
            <Avatar user={user} size="sm" />
            <span className="min-w-0 flex-1">
              <span className="block text-[10px] font-semibold tracking-[0.08em] text-ink-400 uppercase">
                {t('account.signedInAs')}
              </span>
              <span className="block truncate text-sm font-medium text-ink-900">
                {user.name}
              </span>
              <span className="block truncate text-xs text-ink-400">
                {user.email}
              </span>
            </span>
          </div>

          <div className="p-1">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onOpenSettings();
                setOpen(false);
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-ink-600 transition-colors hover:bg-paper-100 hover:text-ink-900"
            >
              <Icon name="settings" className="size-4 shrink-0" />
              {t('account.settings')}
            </button>
          </div>
          <div className="space-y-2.5 border-t border-paper-300/60 px-3 py-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-ink-600">{t('theme.label')}</span>
              <ThemeToggle preference={theme} onChange={onThemeChange} />
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-ink-600">{t('locale.label')}</span>
              <div
                role="group"
                aria-label={t('locale.label')}
                className="inline-flex items-center gap-0.5 rounded-lg bg-paper-100 p-0.5 ring-1 ring-paper-300 ring-inset"
              >
                {LOCALES.map((entry) => {
                  const active = entry.code === locale;
                  return (
                    <button
                      key={entry.code}
                      type="button"
                      onClick={() => setLocale(entry.code)}
                      aria-pressed={active}
                      title={entry.label}
                      className={`inline-flex h-7 items-center rounded-md px-2 font-mono text-[11px] font-semibold transition-colors ${
                        active
                          ? 'bg-paper-50 text-petrol-600 shadow-sm'
                          : 'text-ink-400 hover:text-ink-800'
                      }`}
                    >
                      {entry.short}
                      <span className="sr-only">{entry.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="border-t border-paper-300/60 p-1">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-berry-500 transition-colors hover:bg-berry-100"
            >
              <Icon name="chevron-left" className="size-4 shrink-0" />
              {t('nav.logout')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
