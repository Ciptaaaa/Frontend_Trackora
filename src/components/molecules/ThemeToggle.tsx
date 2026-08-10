import Icon, { type IconName } from '../atoms/Icon';
import { useT } from '../../i18n/LocaleContext';
import type { ThemePreference } from '../../lib/theme';
import type { TranslationKey } from '../../i18n';

interface ThemeToggleProps {
  preference: ThemePreference;
  onChange: (preference: ThemePreference) => void;
  tone?: 'default' | 'inverse';
}

const OPTIONS: ReadonlyArray<{
  value: ThemePreference;
  icon: IconName;
  labelKey: TranslationKey;
}> = [
  { value: 'light', icon: 'sun', labelKey: 'theme.light' },
  { value: 'dark', icon: 'moon', labelKey: 'theme.dark' },
  { value: 'system', icon: 'monitor', labelKey: 'theme.system' },
];
export default function ThemeToggle({
  preference,
  onChange,
  tone = 'default',
}: ThemeToggleProps) {
  const t = useT();
  const inverse = tone === 'inverse';

  return (
    <div
      role="group"
      aria-label={t('theme.label')}
      className={`inline-flex items-center gap-0.5 rounded-lg p-0.5 ring-1 ring-inset ${
        inverse ? 'bg-nav-surface ring-nav-border' : 'bg-paper-100 ring-paper-300'
      }`}
    >
      {OPTIONS.map((option) => {
        const active = option.value === preference;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={active}
            title={t(option.labelKey)}
            className={`inline-flex size-7 items-center justify-center rounded-md transition-colors ${
              active
                ? inverse
                  ? 'bg-nav-accent text-nav-text'
                  : 'bg-paper-50 text-petrol-600 shadow-sm'
                : inverse
                  ? 'text-nav-muted hover:text-nav-text'
                  : 'text-ink-400 hover:text-ink-800'
            }`}
          >
            <Icon name={option.icon} className="size-3.5" />
            <span className="sr-only">{t(option.labelKey)}</span>
          </button>
        );
      })}
    </div>
  );
}
