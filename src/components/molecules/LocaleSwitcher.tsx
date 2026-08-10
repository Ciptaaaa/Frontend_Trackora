import { useRef, useState } from 'react';
import Icon from '../atoms/Icon';
import { LOCALES, type Locale } from '../../i18n';
import { useLocale } from '../../i18n/LocaleContext';
import { useDismissable } from '../../lib/useDismissable';

export default function LocaleSwitcher() {
  const { locale, t, setLocale } = useLocale();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const current = LOCALES.find((entry) => entry.code === locale);

  useDismissable(open, rootRef, () => setOpen(false));

  function choose(next: Locale) {
    setLocale(next);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={t('locale.label')}
        title={t('locale.label')}
        className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-ink-400 transition-colors hover:bg-paper-200 hover:text-ink-900"
      >
        <Icon name="globe" className="size-4" />
        <span className="text-[11px] font-semibold">{current?.short ?? 'ID'}</span>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t('locale.label')}
          className="absolute top-full right-0 z-40 mt-1.5 w-44 overflow-hidden rounded-xl bg-paper-50 p-1 shadow-lg ring-1 ring-paper-300"
        >
          {LOCALES.map((entry) => (
            <li key={entry.code} role="option" aria-selected={entry.code === locale}>
              <button
                type="button"
                onClick={() => choose(entry.code)}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  entry.code === locale
                    ? 'bg-petrol-50 font-medium text-petrol-600'
                    : 'text-ink-600 hover:bg-paper-100'
                }`}
              >
                <span className="w-6 font-mono text-[11px] text-ink-400">
                  {entry.short}
                </span>
                {entry.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
