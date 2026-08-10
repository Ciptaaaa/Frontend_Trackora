import { useId, useState, type FormEvent } from 'react';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';
import TextField from '../atoms/TextField';
import PasswordField from '../molecules/PasswordField';
import { useT } from '../../i18n/LocaleContext';
import { login, register, ApiError } from '../../lib/api';
import type { User } from '../../types/domain';

export type AuthMode = 'login' | 'register';

interface AuthFormProps {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  onAuthenticated: (user: User) => void;
}

export default function AuthForm({
  mode,
  onModeChange,
  onAuthenticated,
}: AuthFormProps) {
  const t = useT();
  const formId = useId();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isRegister = mode === 'register';

  function switchMode(next: AuthMode) {
    setError(null);
    setPassword('');
    onModeChange(next);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (isRegister && name.trim().length < 2) {
      setError(t('auth.errNameShort'));
      return;
    }
    if (!email.includes('@')) {
      setError(t('auth.errEmail'));
      return;
    }
    if (password.length < 8) {
      setError(t('auth.errPasswordShort'));
      return;
    }

    setBusy(true);
    try {
      const user = isRegister
        ? await register(name, email, password)
        : await login(email, password);
      onAuthenticated(user);
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.httpStatus === 0
            ? t('auth.errNetwork')
            : caught.message
          : t('auth.errGeneric'),
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-7">
        <h1 className="font-display text-2xl leading-tight font-semibold tracking-tight text-ink-900">
          {isRegister ? t('auth.registerTitle') : t('auth.loginTitle')}
        </h1>
        <p className="mt-1.5 text-sm text-ink-400">
          {isRegister ? t('auth.registerSubtitle') : t('auth.loginSubtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        {isRegister && (
          <TextField
            label={t('auth.name')}
            id={`${formId}-name`}
            value={name}
            autoComplete="name"
            onChange={(event) => setName(event.target.value)}
            className="h-11"
          />
        )}

        <TextField
          label={t('auth.email')}
          id={`${formId}-email`}
          type="email"
          inputMode="email"
          value={email}
          autoComplete="email"
          placeholder={t('auth.emailPlaceholder')}
          onChange={(event) => setEmail(event.target.value)}
          className="h-11"
        />

        <PasswordField
          label={t('auth.password')}
          id={`${formId}-password`}
          value={password}
          autoComplete={isRegister ? 'new-password' : 'current-password'}
          placeholder={t('auth.passwordPlaceholder')}
          hint={isRegister ? t('auth.passwordHint') : undefined}
          onChange={(event) => setPassword(event.target.value)}
        />

        {error !== null && (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-lg bg-berry-100 px-3 py-2.5 text-xs leading-relaxed text-berry-700"
          >
            <Icon name="alert" className="mt-px size-3.5 shrink-0" />
            {error}
          </p>
        )}

        <Button type="submit" disabled={busy} className="mt-1 h-11 w-full">
          {busy
            ? t('auth.processing')
            : isRegister
              ? t('auth.register')
              : t('auth.login')}
        </Button>
      </form>

      <p className="mt-5 text-center text-xs text-ink-400">
        {isRegister ? t('auth.haveAccount') : t('auth.noAccount')}{' '}
        <button
          type="button"
          onClick={() => switchMode(isRegister ? 'login' : 'register')}
          className="rounded font-medium text-petrol-600 underline underline-offset-2 transition-colors hover:text-petrol-700"
        >
          {isRegister ? t('auth.toLogin') : t('auth.toRegister')}
        </button>
      </p>

      <p className="mt-6 rounded-lg bg-saffron-100 px-3 py-2.5 text-[11px] leading-relaxed text-saffron-600">
        <strong className="font-semibold">{t('auth.testMode')}</strong>{' '}
        {t('auth.testModeBody')}
      </p>
    </div>
  );
}
