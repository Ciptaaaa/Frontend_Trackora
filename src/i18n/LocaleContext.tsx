import { createContext, useContext } from 'react';
import { createTranslator, type Locale, type Translate } from './index';

interface LocaleContextValue {
  locale: Locale;
  t: Translate;
  setLocale: (locale: Locale) => void;
}

const FALLBACK: LocaleContextValue = {
  locale: 'id',
  t: createTranslator('id'),
  setLocale: () => undefined,
};

const LocaleContext = createContext<LocaleContextValue>(FALLBACK);

export const LocaleProvider = LocaleContext.Provider;

export function useLocale(): LocaleContextValue {
  return useContext(LocaleContext);
}
export function useT(): Translate {
  return useContext(LocaleContext).t;
}
