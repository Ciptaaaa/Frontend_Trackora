import { useEffect, useState } from 'react';
import Modal from '../molecules/Modal';
import TextField from '../atoms/TextField';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';
import ThemeToggle from '../molecules/ThemeToggle';
import { LOCALES } from '../../i18n';
import { useLocale } from '../../i18n/LocaleContext';
import { updateProfile } from '../../lib/api';
import { describeError } from '../../lib/errors';
import type { ThemePreference } from '../../lib/theme';
import type { User } from '../../types/domain';

interface SettingsDialogProps {
  open: boolean;
  user: User;
  theme: ThemePreference;
  onClose: () => void;
  onThemeChange: (preference: ThemePreference) => void;
  onSaved: (user: User) => void;
  onLogout: () => void;
}

const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export default function SettingsDialog({
  open,
  user,
  theme,
  onClose,
  onThemeChange,
  onSaved,
  onLogout,
}: SettingsDialogProps) {
  const { locale, t, setLocale } = useLocale();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    if (!open) return;
    setName(user.name);
    setEmail(user.email);
    setError(null);
    setSaved(false);
  }, [open, user]);

  const dirty = name !== user.name || email !== user.email;

  async function handleSave() {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (trimmedName === '') {
      setError(t('settings.nameRequired'));
      return;
    }
    if (!EMAIL_SHAPE.test(trimmedEmail)) {
      setError(t('settings.emailInvalid'));
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const updated = await updateProfile({
        publicId: user.public_id,
        name: trimmedName,
        email: trimmedEmail,
      });
      onSaved(updated);
      setSaved(true);
    } catch (caught: unknown) {
      setError(describeError(caught, t));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      title={t('settings.title')}
      onClose={saving ? () => undefined : onClose}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            {t('common.close')}
          </Button>
          <Button onClick={() => void handleSave()} disabled={saving || !dirty}>
            {saving ? t('common.saving') : t('settings.save')}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <section className="space-y-3">
          <h3 className="text-[10px] font-semibold tracking-[0.08em] text-ink-400 uppercase">
            {t('settings.profile')}
          </h3>

          <TextField
            label={t('settings.name')}
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setSaved(false);
            }}
            disabled={saving}
            autoComplete="name"
          />

          <TextField
            label={t('settings.email')}
            type="email"
            value={email}
            readonly
            onChange={(event) => {
              setEmail(event.target.value);
              setSaved(false);
            }}
            disabled={saving}
            autoComplete="email"
          />

          {error !== null && (
            <p role="alert" className="text-xs leading-relaxed text-berry-500">
              {error}
            </p>
          )}

          {saved && error === null && (
            <p className="flex items-center gap-1.5 text-xs text-petrol-600">
              <Icon name="check" className="size-3.5 shrink-0" />
              {t('settings.saved')}
            </p>
          )}
        </section>

        <section className="space-y-3 border-t border-paper-300/60 pt-4">
          <h3 className="text-[10px] font-semibold tracking-[0.08em] text-ink-400 uppercase">
            {t('settings.appearance')}
          </h3>

          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-ink-600">{t('theme.label')}</span>
            <ThemeToggle preference={theme} onChange={onThemeChange} />
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-ink-600">{t('locale.label')}</span>
            <div
              role="group"
              aria-label={t('locale.label')}
              className="inline-flex items-center gap-0.5 rounded-lg bg-paper-100 p-0.5 ring-1 ring-paper-300 ring-inset"
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
                    className={`inline-flex h-7 items-center rounded-md px-2 font-mono text-[11px] font-semibold transition-colors ${
                      active
                        ? 'bg-paper-50 text-petrol-600 shadow-sm'
                        : 'text-ink-400 hover:text-ink-800'
                    }`}
                  >
                    {entry.short}
                    <span className="sr-only">{entry.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="space-y-3 border-t border-paper-300/60 pt-4">
          <h3 className="text-[10px] font-semibold tracking-[0.08em] text-ink-400 uppercase">
            {t('settings.session')}
          </h3>

          <Button
            variant="secondary"
            onClick={onLogout}
            disabled={saving}
            className="w-full text-berry-500"
          >
            <Icon name="chevron-left" className="size-3.5" />
            {t('nav.logout')}
          </Button>
        </section>
      </div>
    </Modal>
  );
}
