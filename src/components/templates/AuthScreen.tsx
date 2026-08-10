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
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <section className="relative flex shrink-0 items-center overflow-hidden bg-nav-surface px-6 py-6 lg:w-[46%] lg:px-12 lg:py-0">
        <div className="relative z-10 w-full lg:max-w-md">
          <Logo tone="inverse" />

          <h2 className="mt-6 hidden font-display text-3xl leading-[1.15] font-semibold tracking-tight text-nav-text lg:block xl:text-4xl">
            {t('auth.heroLine')}
          </h2>

          <p className="mt-4 hidden max-w-sm text-sm leading-relaxed text-nav-muted lg:block">
            {t('auth.heroBody')}
          </p>

          <p className="mt-3 text-xs text-nav-muted lg:hidden">
            {t('auth.heroMobile')}
          </p>
        </div>
        <div
          className="absolute right-0 bottom-0 flex h-24 items-end gap-1.5 px-6 opacity-60 lg:h-auto lg:gap-2.5 lg:px-12 lg:pb-14"
          aria-hidden="true"
        >
          {SPINE_PATTERN.map((height, index) => (
            <span
              key={index}
              className={`w-1.5 rounded-full lg:w-2.5 ${
                index === 7
                  ? 'bg-saffron-400'
                  : index % 3 === 0
                    ? 'bg-petrol-200/70'
                    : 'bg-petrol-400/50'
              }`}
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
        
      </section>
      <section className="relative flex flex-1 items-center justify-center bg-paper-100 px-6 py-10 sm:px-10">
        <div className="absolute top-4 right-4 flex items-center gap-2 sm:top-6 sm:right-6">
          <ThemeToggle preference={theme} onChange={onThemeChange} />
          <LocaleSwitcher />
        </div>

        <AuthForm
          mode={mode}
          onModeChange={onModeChange}
          onAuthenticated={onAuthenticated}
        />
      </section>
    </div>
  );
}
