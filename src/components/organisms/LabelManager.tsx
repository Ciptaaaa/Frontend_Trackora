import { useEffect, useState } from 'react';
import Modal from '../molecules/Modal';
import TextField from '../atoms/TextField';
import Button from '../atoms/Button';
import IconButton from '../atoms/IconButton';
import Spinner from '../atoms/Spinner';
import { useT } from '../../i18n/LocaleContext';
import {
  getAllLabels,
  createLabel,
  updateLabel,
  deleteLabel,
} from '../../lib/api';
import { describeError } from '../../lib/errors';
import type { Label } from '../../types/domain';

interface LabelManagerProps {
  open: boolean;
  onClose: () => void;
  onChanged: () => void;
}
const PALETTE = [
  '#0F766E',
  '#0369A1',
  '#4F46E5',
  '#9333EA',
  '#BE123C',
  '#EA580C',
  '#CA8A04',
  '#15803D',
] as const;

export default function LabelManager({
  open,
  onClose,
  onChanged,
}: LabelManagerProps) {
  const t = useT();
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState<string>(PALETTE[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    let live = true;
    setLoading(true);
    setError(null);
    resetForm();

    getAllLabels()
      .then((fetched) => {
        if (live) setLabels(fetched);
      })
      .catch((caught: unknown) => {
        if (live) setError(describeError(caught, t));
      })
      .finally(() => {
        if (live) setLoading(false);
      });

    return () => {
      live = false;
    };
  }, [open, t]);

  function resetForm() {
    setName('');
    setColor(PALETTE[0]);
    setEditingId(null);
  }

  function startEdit(label: Label) {
    setEditingId(label.public_id);
    setName(label.name);
    setColor(label.color);
    setError(null);
  }

  async function handleSubmit() {
    const trimmed = name.trim();
    if (trimmed === '') {
      setError(t('label.errName'));
      return;
    }

    setBusy(true);
    setError(null);

    try {
      if (editingId === null) {
        const created = await createLabel({ name: trimmed, color });
        setLabels((current) => [...current, created]);
      } else {
        const updated = await updateLabel(editingId, { name: trimmed, color });
        setLabels((current) =>
          current.map((label) =>
            label.public_id === editingId ? updated : label,
          ),
        );
      }
      resetForm();
      onChanged();
    } catch (caught: unknown) {
      setError(describeError(caught, t));
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(label: Label) {
    if (!window.confirm(t('label.deleteConfirm'))) return;

    setBusy(true);
    setError(null);

    try {
      await deleteLabel(label.public_id);
      setLabels((current) =>
        current.filter((item) => item.public_id !== label.public_id),
      );
      if (editingId === label.public_id) resetForm();
      onChanged();
    } catch (caught: unknown) {
      setError(describeError(caught, t));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} title={t('label.manage')} onClose={onClose}>
      <div className="space-y-5">
        <section>
          <h3 className="mb-2 text-[11px] font-semibold tracking-wide text-ink-400 uppercase">
            {t('label.title')}
          </h3>

          {loading ? (
            <div className="flex justify-center py-6">
              <Spinner label={t('app.loading')} size="sm" />
            </div>
          ) : labels.length === 0 ? (
            <p className="rounded-lg border border-dashed border-paper-300 px-3 py-5 text-center text-[11px] leading-relaxed text-ink-400">
              {t('label.empty')}
            </p>
          ) : (
            <ul className="space-y-1">
              {labels.map((label) => (
                <li
                  key={label.public_id}
                  className={`flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors ${
                    editingId === label.public_id
                      ? 'bg-petrol-50 ring-1 ring-petrol-400'
                      : 'hover:bg-paper-100'
                  }`}
                >
                  <span
                    className="size-3 shrink-0 rounded-full"
                    style={{ backgroundColor: label.color }}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1 truncate text-xs font-medium text-ink-800">
                    {label.name}
                  </span>
                  <IconButton
                    icon="pencil"
                    label={t('label.edit', { name: label.name })}
                    disabled={busy}
                    onClick={() => startEdit(label)}
                    className="size-7"
                  />
                  <IconButton
                    icon="trash"
                    label={t('label.delete', { name: label.name })}
                    disabled={busy}
                    onClick={() => void handleDelete(label)}
                    className="size-7"
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="border-t border-paper-300/60 pt-4">
          <h3 className="mb-2 text-[11px] font-semibold tracking-wide text-ink-400 uppercase">
            {editingId === null ? t('label.new') : t('label.title')}
          </h3>

          <div className="space-y-3">
            <TextField
              label={t('label.name')}
              value={name}
              placeholder={t('label.namePlaceholder')}
              disabled={busy}
              onChange={(event) => setName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  void handleSubmit();
                }
              }}
            />

            <div>
              <span className="mb-1.5 block text-xs font-medium text-ink-600">
                {t('label.color')}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PALETTE.map((swatch) => (
                  <button
                    key={swatch}
                    type="button"
                    onClick={() => setColor(swatch)}
                    disabled={busy}
                    aria-label={swatch}
                    aria-pressed={color === swatch}
                    style={{ backgroundColor: swatch }}
                    className={`size-7 rounded-full transition disabled:pointer-events-none ${
                      color === swatch
                        ? 'ring-2 ring-ink-900 ring-offset-2 ring-offset-paper-50'
                        : 'ring-1 ring-paper-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button size="sm" disabled={busy} onClick={() => void handleSubmit()}>
                {busy
                  ? t('common.saving')
                  : editingId === null
                    ? t('label.create')
                    : t('common.save')}
              </Button>
              {editingId !== null && (
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={busy}
                  onClick={resetForm}
                >
                  {t('common.cancel')}
                </Button>
              )}
            </div>
          </div>
        </section>

        {error !== null && (
          <p role="alert" className="text-xs leading-relaxed text-berry-500">
            {error}
          </p>
        )}
      </div>
    </Modal>
  );
}
