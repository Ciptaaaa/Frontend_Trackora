import { LOCALES } from '../../i18n';
import { useLocale } from '../../i18n/LocaleContext';

export default function LocaleSegmented() {
  const { locale, t, setLocale } = useLocale();

  return (
    <div
      role="group"
      aria-label={t('locale.label')}
      className="inline-flex items-center gap-0.5 rounded-lg bg-paper-100 p-0.5 ring-1 ring-paper-300 ring-inset dark:ring-paper-400"
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
            className={`inline-flex h-9 items-center rounded-md px-2.5 text-[11px] font-semibold transition-colors max-md:h-11 ${
              active
                ? 'bg-paper-50 text-petrol-700 shadow-sm'
                : 'text-ink-400 hover:text-ink-800'
            }`}
          >
            {entry.short}
            <span className="sr-only">{entry.label}</span>
          </button>
        );
      })}
    </div>
  );
}
