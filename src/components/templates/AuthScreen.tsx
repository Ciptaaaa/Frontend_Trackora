import Logo from '../atoms/Logo';
import AuthForm, { type AuthMode } from '../organisms/AuthForm';
import ThemeToggle from '../molecules/ThemeToggle';
import LocaleSwitcher from '../molecules/LocaleSwitcher';
import { useT } from '../../i18n/LocaleContext';
import type { ThemePreference } from '../../lib/theme';
import type { User } from '../../types/domain';

interface AuthScreenProps {
  mode: AuthMode;
  theme: ThemePreference;
  onThemeChange: (preference: ThemePreference) => void;
  onModeChange: (mode: AuthMode) => void;
  onAuthenticated: (user: User) => void;
}
const SPINE_PATTERN = [34, 58, 42, 76, 30, 64, 48, 88, 40, 56, 72, 36] as const;

export default function AuthScreen({
  mode,
  theme,
  onThemeChange,
  onModeChange,
  onAuthenticated,
}: AuthScreenProps) {
  const t = useT();

  return (
    <div className="min-h-dvh bg-paper-50 lg:grid lg:grid-cols-[1.05fr_1fr]">
      <section className="relative hidden overflow-hidden border-r border-paper-300 bg-petrol-50 px-14 py-12 lg:flex lg:flex-col dark:border-paper-400">
        <Logo />

        <div className="my-auto max-w-md py-16">
          <span className="inline-flex items-center gap-2 rounded-full bg-mint-100 px-3 py-1 text-xs font-medium text-mint-600">
            <span className="size-1.5 rounded-full bg-mint-600" aria-hidden="true" />
            {t('spine.title')}
          </span>
          <h2 className="mt-6 text-4xl leading-[1.08] font-semibold tracking-[-0.035em] text-ink-900 xl:text-5xl">
            {t('auth.heroLine')}
          </h2>
          <p className="mt-5 max-w-sm text-base leading-relaxed text-ink-600">
            {t('auth.heroBody')}
          </p>
        </div>

        <div className="relative max-w-md rounded-2xl bg-paper-50 p-5 shadow-sm ring-1 ring-paper-300 dark:ring-paper-400">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-ink-400">
              {t('spine.title')}
            </span>
            <span className="rounded-full bg-petrol-50 px-2 py-0.5 text-[11px] font-medium text-petrol-700">
              {t('spine.overdue')}
            </span>
          </div>
          <div className="mt-4 flex h-24 items-end gap-1.5" aria-hidden="true">
            {SPINE_PATTERN.map((height, index) => (
              <span
                key={index}
                className={`flex-1 rounded-full ${
                  index === 7
                    ? 'bg-petrol-600'
                    : index % 3 === 0
                      ? 'bg-petrol-200'
                      : 'bg-petrol-400/45'
                }`}
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="relative flex min-h-dvh flex-col bg-paper-50">
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-4 sm:px-8">
          <span className="lg:hidden">
            <Logo />
          </span>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle preference={theme} onChange={onThemeChange} />
            <LocaleSwitcher />
          </div>
        </div>

        <p className="max-w-sm px-4 text-sm leading-relaxed text-ink-400 sm:px-8 lg:hidden">
          {t('auth.heroMobile')}
        </p>

        <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
          <AuthForm
            mode={mode}
            onModeChange={onModeChange}
            onAuthenticated={onAuthenticated}
          />
        </div>
      </section>
    </div>
  );
}
