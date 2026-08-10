import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type SetStateAction,
} from 'react';
import Button from '../atoms/Button';
import IconButton from '../atoms/IconButton';
import TextField from '../atoms/TextField';
import TextArea from '../atoms/TextArea';
import DetailSection from '../molecules/DetailSection';
import DueBadge from '../molecules/DueBadge';
import LabelChip from '../atoms/LabelChip';
import Avatar from '../atoms/Avatar';
import Icon from '../atoms/Icon';
import Spinner from '../atoms/Spinner';
import LabelPicker from './LabelPicker';
import AssigneePicker from './AssigneePicker';
import CommentThread from './CommentThread';
import { useT } from '../../i18n/LocaleContext';
import { lockBodyScroll } from '../../lib/scrollLock';
import { toApiDate, toInputDate } from '../../lib/date';
import {
  updateCard,
  getAttachments,
  uploadAttachment,
  deleteAttachment,
  removeCardLabel,
  unassignUser,
} from '../../lib/api';
import { describeError } from '../../lib/errors';
import type { Card, List, Label, User, Attachment } from '../../types/domain';

interface CardDetailProps {
  card: Card | null;
  list: List | undefined;
  onClose: () => void;
  onDelete: (cardPublicId: string) => void;
  onUpdate: (card: Card) => void;
  deleting: boolean;
}

export default function CardDetail({
  card,
  list,
  onClose,
  onDelete,
  onUpdate,
  deleting,
}: CardDetailProps) {
  const t = useT();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [labels, setLabels] = useState<Label[]>([]);
  const [assignees, setAssignees] = useState<User[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loadingAttachments, setLoadingAttachments] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showLabelPicker, setShowLabelPicker] = useState(false);
  const [showAssigneePicker, setShowAssigneePicker] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const labelsRef = useRef<Label[]>([]);
  const assigneesRef = useRef<User[]>([]);
  const cardRef = useRef<Card | null>(card);
  cardRef.current = card;

  function commitLabels(update: SetStateAction<Label[]>) {
    const next = typeof update === 'function' ? update(labelsRef.current) : update;
    labelsRef.current = next;
    setLabels(next);

    const current = cardRef.current;
    if (current !== null) onUpdate({ ...current, labels: next });
  }

  function commitAssignees(update: SetStateAction<User[]>) {
    const next = typeof update === 'function' ? update(assigneesRef.current) : update;
    assigneesRef.current = next;
    setAssignees(next);

    const current = cardRef.current;
    if (current !== null) onUpdate({ ...current, assignees: next });
  }

  const cardPublicId = card?.public_id ?? null;

  useEffect(() => {
    const current = cardRef.current;
    if (cardPublicId === null || current === null) return;

    const release = lockBodyScroll();
    setTitle(current.title);
    setDescription(current.description);
    setDueDate(toInputDate(current.due_date));
    setLabels(current.labels);
    setAssignees(current.assignees);
    labelsRef.current = current.labels;
    assigneesRef.current = current.assignees;
    setAttachments([]);
    setEditing(false);
    setError(null);

    let live = true;
    setLoadingAttachments(true);
    getAttachments(cardPublicId)
      .then((fetched) => {
        if (live) setAttachments(fetched);
      })
      .catch(() => {
        if (live) setAttachments([]);
      })
      .finally(() => {
        if (live) setLoadingAttachments(false);
      });

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);

    return () => {
      live = false;
      release();
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [cardPublicId, onClose]);

  async function handleSave() {
    if (card === null) return;

    const trimmed = title.trim();
    if (trimmed === '') {
      setError(t('detail.errTitle'));
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const updated = await updateCard(card.public_id, {
        list_public_id: card.list_public_id,
        title: trimmed,
        description: description.trim(),
        due_date: toApiDate(dueDate),
        position: card.position,
      });
      onUpdate({
        ...updated,
        labels: labelsRef.current,
        assignees: assigneesRef.current,
        attachments,
      });
      setEditing(false);
    } catch (caught: unknown) {
      setError(describeError(caught, t));
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    if (card === null) return;
    setTitle(card.title);
    setDescription(card.description);
    setDueDate(toInputDate(card.due_date));
    setEditing(false);
    setError(null);
  }

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    if (card === null || event.target.files === null) return;

    const file = event.target.files[0];
    if (file === undefined) return;

    setUploading(true);
    setError(null);

    try {
      const uploaded = await uploadAttachment(card.public_id, file);
      setAttachments((current) => [...current, uploaded]);
    } catch (caught: unknown) {
      setError(describeError(caught, t));
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  }

  async function handleRemoveLabel(label: Label) {
    if (card === null) return;
    setError(null);
    try {
      await removeCardLabel(card.public_id, label.public_id);
      commitLabels((current) =>
        current.filter((item) => item.public_id !== label.public_id),
      );
    } catch (caught: unknown) {
      setError(describeError(caught, t));
    }
  }

  async function handleRemoveAssignee(user: User) {
    if (card === null) return;
    setError(null);
    try {
      await unassignUser(card.public_id, user.public_id);
      commitAssignees((current) =>
        current.filter((item) => item.public_id !== user.public_id),
      );
    } catch (caught: unknown) {
      setError(describeError(caught, t));
    }
  }

  async function handleDeleteAttachment(attachment: Attachment) {
    if (card === null) return;

    setError(null);
    try {
      await deleteAttachment(card.public_id, attachment.public_id);
      setAttachments((current) =>
        current.filter((item) => item.public_id !== attachment.public_id),
      );
    } catch (caught: unknown) {
      setError(describeError(caught, t));
    }
  }

  if (card === null) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-stretch sm:justify-end">
        <div
          className="absolute inset-0 bg-scrim backdrop-blur-[2px]"
          onClick={onClose}
          aria-hidden="true"
        />

        <div
          role="dialog"
          aria-modal="true"
          aria-label={card.title}
          className="relative flex max-h-[88dvh] w-full flex-col rounded-t-2xl bg-paper-50 shadow-2xl sm:h-full sm:max-h-none sm:w-full sm:max-w-md sm:rounded-none"
        >
          <span
            className="mx-auto mt-2 h-1 w-9 shrink-0 rounded-full bg-paper-300 sm:hidden"
            aria-hidden="true"
          />

          <header className="flex shrink-0 items-start gap-3 border-b border-paper-300/60 px-5 py-4">
            <div className="min-w-0 flex-1">
              <span className="font-mono text-[10px] tracking-wide text-ink-400 uppercase">
                {list?.title ?? t('detail.noList')}
              </span>
              {editing ? (
                <TextField
                  label={t('detail.titleLabel')}
                  hideLabel
                  value={title}
                  disabled={saving}
                  onChange={(event) => setTitle(event.target.value)}
                  className="mt-1 font-display text-lg font-semibold"
                />
              ) : (
                <h2 className="mt-1 font-display text-lg leading-snug font-semibold text-ink-900">
                  {card.title}
                </h2>
              )}
            </div>
            <IconButton icon="close" label={t('detail.close')} onClick={onClose} />
          </header>

          <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5 scrollbar-slim">
            <DetailSection title={t('detail.description')}>
              {editing ? (
                <TextArea
                  label={t('detail.description')}
                  hideLabel
                  value={description}
                  rows={4}
                  disabled={saving}
                  onChange={(event) => setDescription(event.target.value)}
                />
              ) : (
                <p className="text-sm leading-relaxed text-ink-600">
                  {card.description.length > 0
                    ? card.description
                    : t('detail.noDescription')}
                </p>
              )}
            </DetailSection>

            <DetailSection title={t('detail.due')}>
              {editing ? (
                <input
                  type="date"
                  value={dueDate}
                  disabled={saving}
                  onChange={(event) => setDueDate(event.target.value)}
                  className="w-full rounded-lg bg-paper-100 px-3 py-2 text-sm text-ink-900 ring-1 ring-paper-300 ring-inset transition hover:bg-paper-50 focus:bg-paper-50"
                />
              ) : card.due_date !== null ? (
                <DueBadge dueDate={card.due_date} />
              ) : (
                <p className="text-sm text-ink-400">{t('detail.noDue')}</p>
              )}
            </DetailSection>

            <DetailSection
              title={t('detail.labels')}
              action={
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowLabelPicker(true)}
                >
                  {t('detail.addLabel')}
                </Button>
              }
            >
              {labels.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {labels.map((label) => (
                    <span
                      key={label.public_id}
                      className="inline-flex items-center gap-1"
                    >
                      <LabelChip label={label} />
                      <button
                        type="button"
                        onClick={() => void handleRemoveLabel(label)}
                        aria-label={t('detail.removeLabel', { name: label.name })}
                        className="rounded-full p-0.5 text-ink-400 transition hover:bg-paper-200 hover:text-ink-600"
                      >
                        <Icon name="close" className="size-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-ink-400">{t('detail.noLabels')}</p>
              )}
            </DetailSection>

            <DetailSection
              title={t('detail.assignees')}
              action={
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowAssigneePicker(true)}
                >
                  {t('detail.addAssignee')}
                </Button>
              }
            >
              {assignees.length > 0 ? (
                <ul className="flex flex-col gap-2">
                  {assignees.map((assignee) => (
                    <li key={assignee.public_id} className="flex items-center gap-2.5">
                      <Avatar user={assignee} size="sm" />
                      <span className="min-w-0 flex-1 truncate text-sm text-ink-600">
                        {assignee.name}
                      </span>
                      <IconButton
                        icon="close"
                        label={t('detail.removeAssignee', { name: assignee.name })}
                        onClick={() => void handleRemoveAssignee(assignee)}
                        className="size-7"
                      />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-ink-400">{t('detail.noAssignees')}</p>
              )}
            </DetailSection>

            <DetailSection
              title={t('detail.attachments')}
              action={
                <label>
                  <input
                    type="file"
                    disabled={uploading}
                    onChange={handleUpload}
                    className="sr-only"
                  />
                  <span className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-ink-600 transition-colors hover:bg-paper-200 hover:text-ink-900">
                    <Icon name="upload" className="size-3.5" />
                    {uploading ? t('detail.uploading') : t('detail.upload')}
                  </span>
                </label>
              }
            >
              {loadingAttachments ? (
                <div className="flex justify-center py-3">
                  <Spinner label={t('app.loading')} size="sm" />
                </div>
              ) : attachments.length > 0 ? (
                <ul className="flex flex-col gap-1.5">
                  {attachments.map((attachment) => (
                    <li
                      key={attachment.public_id}
                      className="flex items-center gap-2 rounded-lg bg-paper-100 px-2.5 py-2"
                    >
                      <Icon
                        name="paperclip"
                        className="size-3.5 shrink-0 text-ink-400"
                      />
                      <a
                        href={attachment.file}
                        target="_blank"
                        rel="noreferrer"
                        className="min-w-0 flex-1 truncate text-xs text-ink-600 hover:underline"
                      >
                        {attachment.file.split('/').pop() ?? t('detail.attachment')}
                      </a>
                      <IconButton
                        icon="trash"
                        label={t('detail.removeAttachment')}
                        onClick={() => void handleDeleteAttachment(attachment)}
                        className="size-7 shrink-0"
                      />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-ink-400">{t('detail.noAttachments')}</p>
              )}
            </DetailSection>

            <DetailSection title={t('detail.comments')}>
              <CommentThread cardPublicId={card.public_id} />
            </DetailSection>

            {error !== null && (
              <p role="alert" className="text-xs leading-relaxed text-berry-500">
                {error}
              </p>
            )}
          </div>

          <footer className="flex shrink-0 items-center gap-2 border-t border-paper-300/60 px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pb-3">
            {editing ? (
              <>
                <Button size="sm" disabled={saving} onClick={() => void handleSave()}>
                  {saving ? t('detail.saving') : t('detail.save')}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={saving}
                  onClick={handleCancel}
                >
                  {t('detail.cancel')}
                </Button>
              </>
            ) : (
              <>
                <Button size="sm" onClick={() => setEditing(true)}>
                  {t('detail.edit')}
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  disabled={deleting}
                  onClick={() => {
                    if (window.confirm(t('detail.deleteConfirm')))
                      onDelete(card.public_id);
                  }}
                  className="ml-auto"
                >
                  {deleting ? t('detail.deleting') : t('detail.delete')}
                </Button>
              </>
            )}
          </footer>
        </div>
      </div>

      <LabelPicker
        open={showLabelPicker}
        cardPublicId={card.public_id}
        selected={labels}
        onClose={() => setShowLabelPicker(false)}
        onChange={commitLabels}
      />

      <AssigneePicker
        open={showAssigneePicker}
        cardPublicId={card.public_id}
        selected={assignees}
        onClose={() => setShowAssigneePicker(false)}
        onChange={commitAssignees}
      />
    </>
  );
}
