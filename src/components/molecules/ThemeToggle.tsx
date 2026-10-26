import { AnimatedThemeToggler } from '../ui/animated-theme-toggler';
import { useT } from '../../i18n/LocaleContext';
import { resolveTheme, type ThemePreference } from '../../lib/theme';

interface ThemeToggleProps {
  preference: ThemePreference;
  onChange: (preference: ThemePreference) => void;
  tone?: 'default' | 'inverse';
}

export default function ThemeToggle({
  preference,
  onChange,
  tone = 'default',
}: ThemeToggleProps) {
  const t = useT();
  const inverse = tone === 'inverse';

  return (
    <AnimatedThemeToggler
      theme={resolveTheme(preference)}
      onThemeChange={onChange}
      storageKey="trackora.v1.theme"
      label={t('theme.label')}
      title={t('theme.label')}
      variant="circle"
      duration={450}
      className={`inline-flex size-11 items-center justify-center rounded-lg border transition-colors md:size-8 ${
        inverse
          ? 'border-nav-border bg-nav-surface text-nav-muted hover:bg-nav-raised hover:text-nav-text'
          : 'border-paper-300 bg-paper-50 text-ink-400 hover:bg-paper-100 hover:text-ink-800 dark:border-paper-400'
      }`}
    />
  );
}
