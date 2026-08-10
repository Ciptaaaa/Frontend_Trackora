import { useCallback, useEffect, useMemo, useState } from 'react';
import AppShell from './AppShell';
import AuthScreen from './AuthScreen';
import { LocaleProvider } from '../../i18n/LocaleContext';
import {
  createTranslator,
  htmlLangFor,
  readLocale,
  storeLocale,
  type Locale,
} from '../../i18n';
import { getMe, logout } from '../../lib/api';
import { navigate, useRoute } from '../../lib/router';
import {
  applyTheme,
  readThemePreference,
  resolveTheme,
  storeThemePreference,
  type ThemePreference,
} from '../../lib/theme';
import type { User } from '../../types/domain';
export default function TrackoraApp() {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [theme, setTheme] = useState<ThemePreference>('system');
  const [locale, setLocaleState] = useState<Locale>('id');
  const route = useRoute();

  useEffect(() => {
    setTheme(readThemePreference());
    setLocaleState(readLocale());

    let cancelled = false;

    async function boot() {
      try {
        const me = await getMe();
        if (!cancelled) setUser(me);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setChecking(false);
      }
    }

    boot();
    return () => {
      cancelled = true;
    };
  }, []);

  
  useEffect(() => {
    if (checking) return;
    applyTheme(resolveTheme(theme));
    if (theme !== 'system') return;

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applyTheme(resolveTheme('system'));
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [theme, checking]);

  
  useEffect(() => {
    if (checking) return;
    document.documentElement.lang = htmlLangFor(locale);
  }, [locale, checking]);

  useEffect(() => {
    if (checking) return;

    const onAuthRoute = route.name === 'login' || route.name === 'register';

    if (user === null && !onAuthRoute) {
      navigate({ name: 'login' }, { replace: true });
      return;
    }
    if (user !== null && onAuthRoute) {
      navigate({ name: 'boards' }, { replace: true });
    }
  }, [checking, user, route.name]);

  const handleThemeChange = useCallback((preference: ThemePreference) => {
    setTheme(preference);
    storeThemePreference(preference);
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    storeLocale(next);
  }, []);

  const localeValue = useMemo(
    () => ({ locale, t: createTranslator(locale), setLocale }),
    [locale, setLocale],
  );

  const handleLogout = useCallback(async () => {
    await logout();
    setUser(null);
    navigate({ name: 'login' }, { replace: true });
  }, []);

  const handleAuthenticated = useCallback((authenticated: User) => {
    setUser(authenticated);
    navigate({ name: 'boards' }, { replace: true });
  }, []);

  const handleUserUpdate = useCallback((updated: User) => {
    setUser(updated);
  }, []);

  if (checking) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-paper-100">
        <span className="flex items-end gap-1" aria-hidden="true">
          {[0, 1, 2].map((index) => (
            <span
              key={index}
              className="w-1.5 animate-pulse rounded-full bg-petrol-400"
              style={{
                height: `${12 + index * 6}px`,
                animationDelay: `${index * 120}ms`,
              }}
            />
          ))}
        </span>
      </div>
    );
  }

  return (
    <LocaleProvider value={localeValue}>
      {user === null ? (
        <AuthScreen
          mode={route.name === 'register' ? 'register' : 'login'}
          theme={theme}
          onThemeChange={handleThemeChange}
          onModeChange={(mode) => navigate({ name: mode })}
          onAuthenticated={handleAuthenticated}
        />
      ) : (
        <AppShell
          user={user}
          route={route}
          theme={theme}
          onThemeChange={handleThemeChange}
          onUserUpdate={handleUserUpdate}
          onLogout={handleLogout}
        />
      )}
    </LocaleProvider>
  );
}
