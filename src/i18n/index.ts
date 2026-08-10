import { en, id, zh, type Dictionary, type TranslationKey } from './dictionaries';

export type Locale = 'id' | 'en' | 'zh';
export type { TranslationKey };

export const LOCALE_KEY = 'trackora.v1.locale';

const DICTIONARIES: Record<Locale, Dictionary> = { id, en, zh };

export const LOCALES: ReadonlyArray<{
  code: Locale;
  label: string;
  short: string;
  htmlLang: string;
}> = [
  { code: 'id', label: 'Indonesia', short: 'ID', htmlLang: 'id' },
  { code: 'en', label: 'English', short: 'EN', htmlLang: 'en' },
  { code: 'zh', label: '中文', short: '中', htmlLang: 'zh-CN' },
];

export type Translate = (
  key: TranslationKey,
  vars?: Record<string, string | number>,
) => string;

export function isLocale(value: unknown): value is Locale {
  return value === 'id' || value === 'en' || value === 'zh';
}

export function readLocale(): Locale {
  try {
    const stored = localStorage.getItem(LOCALE_KEY);
    if (isLocale(stored)) return stored;
  } catch {}

  if (typeof navigator !== 'undefined') {
    const tag = navigator.language.toLowerCase();
    if (tag.startsWith('zh')) return 'zh';
    if (tag.startsWith('en')) return 'en';
  }
  return 'id';
}

export function storeLocale(locale: Locale): void {
  try {
    localStorage.setItem(LOCALE_KEY, locale);
  } catch {}
}

export function createTranslator(locale: Locale): Translate {
  const dictionary = DICTIONARIES[locale];

  return (key, vars) => {
    const template = dictionary[key];
    if (vars === undefined) return template;

    return Object.entries(vars).reduce(
      (text, [name, value]) => text.replaceAll(`{${name}}`, String(value)),
      template,
    );
  };
}

export function htmlLangFor(locale: Locale): string {
  return LOCALES.find((entry) => entry.code === locale)?.htmlLang ?? 'id';
}
