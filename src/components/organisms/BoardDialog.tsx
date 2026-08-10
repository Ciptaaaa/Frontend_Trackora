import { useEffect, useState } from 'react';
import Modal from '../molecules/Modal';
import TextField from '../atoms/TextField';
import TextArea from '../atoms/TextArea';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';
import Avatar from '../atoms/Avatar';
import Spinner from '../atoms/Spinner';
import { useT } from '../../i18n/LocaleContext';
import { toApiDate, toInputDate } from '../../lib/date';
import { createBoard, updateBoard, addBoardMembers, getUsers } from '../../lib/api';
import { describeError } from '../../lib/errors';
import type { Board, User } from '../../types/domain';

interface BoardDialogProps {
  open: boolean;
  board: Board | null;
  onClose: () => void;
  onSaved: (board: Board) => void;
}

export default function BoardDialog({
  open,
  board,
  onClose,
  onSaved,
}: BoardDialogProps) {
  const t = useT();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [staged, setStaged] = useState<User[]>([]);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!open) return;
    setTitle(board?.title ?? '');
    setDescription(board?.description ?? '');
    setDueDate(toInputDate(board?.due_date ?? null));
    setStaged([]);
    setQuery('');
    setResults([]);
    setError(null);
  }, [open, board]);
  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    let live = true;
    const timer = window.setTimeout(() => {
      getUsers(term)
        .then((users) => {
          if (live) setResults(users);
        })
        .catch(() => {
          if (live) setResults([]);
        })
        .finally(() => {
          if (live) setSearching(false);
        });
    }, 300);

    return () => {
      live = false;
      window.clearTimeout(timer);
    };
  }, [query]);

  function stageMember(user: User) {
    setStaged((current) =>
      current.some((member) => member.public_id === user.public_id)
        ? current
        : [...current, user],
    );
    setQuery('');
    setResults([]);
  }

  function unstageMember(publicId: string) {
    setStaged((current) => current.filter((member) => member.public_id !== publicId));
  }

  async function handleSave() {
    const trimmed = title.trim();
    if (trimmed === '') {
      setError(t('board.errTitle'));
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload = {
        title: trimmed,
        description: description.trim(),
        due_date: toApiDate(dueDate),
      };

      const saved =
        board === null
          ? await createBoard(payload)
          : await updateBoard(board.public_id, payload);

      if (staged.length > 0) {
        await addBoardMembers(
          saved.public_id,
          staged.map((member) => member.public_id),
        );
      }

      onSaved(saved);
      onClose();
    } catch (caught: unknown) {
      setError(describeError(caught, t));
    } finally {
      setSaving(false);
    }
  }

  const showResults = query.trim().length >= 2;

  return (
    <Modal
      open={open}
      title={board === null ? t('board.new') : t('board.edit')}
      onClose={saving ? () => undefined : onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            {t('common.cancel')}
          </Button>
          <Button onClick={() => void handleSave()} disabled={saving}>
            {saving ? t('common.saving') : t('common.save')}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <TextField
          label={t('board.title')}
          value={title}
          placeholder={t('board.titlePlaceholder')}
          onChange={(event) => setTitle(event.target.value)}
          disabled={saving}
        />

        <TextArea
          label={t('board.description')}
          value={description}
          placeholder={t('board.descriptionPlaceholder')}
          rows={2}
          onChange={(event) => setDescription(event.target.value)}
          disabled={saving}
        />

        <div>
          <label
            htmlFor="board-due"
            className="mb-1.5 block text-xs font-medium text-ink-600"
          >
            {t('board.due')}
          </label>
          <input
            id="board-due"
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            disabled={saving}
            className="w-full rounded-lg bg-paper-100 px-3 py-2 text-sm text-ink-900 ring-1 ring-paper-300 ring-inset transition hover:bg-paper-50 focus:bg-paper-50"
          />
        </div>

        <div>
          <label
            htmlFor="board-member-search"
            className="mb-1 block text-xs font-medium text-ink-600"
          >
            {t('board.members')}
          </label>
          <p className="mb-2 text-[11px] leading-relaxed text-ink-400">
            {t('board.membersHint')}
          </p>

          {staged.length > 0 && (
            <ul className="mb-2 flex flex-wrap gap-1.5">
              {staged.map((member) => (
                <li
                  key={member.public_id}
                  className="inline-flex items-center gap-1.5 rounded-full bg-petrol-50 py-1 pr-1.5 pl-1 text-xs font-medium text-petrol-700"
                >
                  <Avatar user={member} size="xs" />
                  <span className="max-w-32 truncate">{member.name}</span>
                  <button
                    type="button"
                    onClick={() => unstageMember(member.public_id)}
                    disabled={saving}
                    aria-label={t('board.removeMember', { name: member.name })}
                    className="shrink-0 rounded-full p-0.5 text-petrol-600 transition hover:bg-petrol-200 disabled:pointer-events-none"
                  >
                    <Icon name="close" className="size-3" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="relative">
            <input
              id="board-member-search"
              type="search"
              value={query}
              placeholder={t('board.searchUser')}
              onChange={(event) => setQuery(event.target.value)}
              disabled={saving}
              autoComplete="off"
              className="w-full rounded-lg bg-paper-100 px-3 py-2 text-sm text-ink-900 ring-1 ring-paper-300 ring-inset transition placeholder:text-ink-400 hover:bg-paper-50 focus:bg-paper-50"
            />

            {showResults && (
              <div className="absolute top-full right-0 left-0 z-10 mt-1 overflow-hidden rounded-xl bg-paper-50 shadow-lg ring-1 ring-paper-300">
                {searching ? (
                  <div className="flex justify-center py-4">
                    <Spinner label={t('app.loading')} size="sm" />
                  </div>
                ) : results.length === 0 ? (
                  <p className="px-3 py-3 text-xs text-ink-400">{t('board.noUsers')}</p>
                ) : (
                  <ul className="max-h-48 overflow-y-auto p-1 scrollbar-slim">
                    {results.map((user) => {
                      const alreadyStaged = staged.some(
                        (member) => member.public_id === user.public_id,
                      );
                      return (
                        <li key={user.public_id}>
                          <button
                            type="button"
                            onClick={() => stageMember(user)}
                            disabled={alreadyStaged}
                            className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition hover:bg-paper-100 disabled:pointer-events-none disabled:opacity-45"
                          >
                            <Avatar user={user} size="sm" />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-xs font-medium text-ink-900">
                                {user.name}
                              </span>
                              <span className="block truncate text-[11px] text-ink-400">
                                {user.email}
                              </span>
                            </span>
                            {alreadyStaged && (
                              <Icon
                                name="check"
                                className="size-3.5 shrink-0 text-petrol-600"
                              />
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>

        {error !== null && (
          <p role="alert" className="text-xs leading-relaxed text-berry-500">
            {error}
          </p>
        )}
      </div>
    </Modal>
  );
}
