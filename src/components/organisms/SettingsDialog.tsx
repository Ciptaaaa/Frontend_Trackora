import { useEffect, useState, type ReactNode } from 'react';
import Modal from '../molecules/Modal';
import TextField from '../atoms/TextField';
import Button from '../atoms/Button';
import Icon, { type IconName } from '../atoms/Icon';
import Avatar from '../atoms/Avatar';
import ThemeToggle from '../molecules/ThemeToggle';
import LocaleSegmented from '../molecules/LocaleSegmented';
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

interface SectionProps {
  icon: IconName;
  title: string;
  hint: string;
  children: ReactNode;
}

function Section({ icon, title, hint, children }: SectionProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-paper-300 bg-paper-50">
      <header className="flex items-start gap-3 border-b border-paper-300 bg-paper-100/70 px-4 py-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-paper-50 text-ink-600 ring-1 ring-paper-300 ring-inset dark:ring-paper-400">
          <Icon name={icon} className="size-4" />
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-ink-900">{title}</h3>
          <p className="mt-0.5 text-xs leading-relaxed text-ink-400">{hint}</p>
        </div>
      </header>
      <div className="px-4 py-4">{children}</div>
    </section>
  );
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
  const { t } = useLocale();
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
  }, [open, user.public_id]);

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
      setName(updated.name);
      setEmail(updated.email);
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
      size="md"
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
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-xl border border-paper-300 bg-paper-100/70 p-4">
          <Avatar user={user} size="lg" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink-900">
              {user.name}
            </p>
            <p className="truncate text-xs text-ink-400">{user.email}</p>
          </div>
        </div>

        <Section
          icon="user"
          title={t('settings.profile')}
          hint={t('settings.profileHint')}
        >
          <div className="space-y-3">
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

            <div>
              <TextField
                label={t('settings.email')}
                type="email"
                value={email}
                readonly
                disabled={saving}
                autoComplete="email"
              />
              <p className="mt-1.5 text-[11px] leading-relaxed text-ink-400">
                {t('settings.emailHint')}
              </p>
            </div>

            {error !== null && (
              <p role="alert" className="text-xs leading-relaxed text-berry-500">
                {error}
              </p>
            )}

            {saved && error === null && (
              <p className="flex items-center gap-1.5 text-xs text-mint-600">
                <Icon name="check" className="size-3.5 shrink-0" />
                {t('settings.saved')}
              </p>
            )}

            {!saved && error === null && dirty && (
              <p className="text-xs leading-relaxed text-ink-400">
                {t('settings.unsaved')}
              </p>
            )}
          </div>
        </Section>

        <Section
          icon="palette"
          title={t('settings.appearance')}
          hint={t('settings.appearanceHint')}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-ink-600">{t('theme.label')}</span>
              <ThemeToggle preference={theme} onChange={onThemeChange} />
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-ink-600">{t('locale.label')}</span>
              <LocaleSegmented />
            </div>
          </div>
        </Section>

        <Section
          icon="logout"
          title={t('settings.session')}
          hint={t('settings.sessionHint')}
        >
          <Button
            variant="danger-ghost"
            onClick={onLogout}
            disabled={saving}
            className="w-full justify-start"
          >
            <Icon name="logout" className="size-4" />
            {t('nav.logout')}
          </Button>
        </Section>
      </div>
    </Modal>
  );
}
