import { useEffect, useRef, useState } from 'react';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';
import { useT } from '../../i18n/LocaleContext';

interface AddListFormProps {
  onSubmit: (title: string) => void;
}
export default function AddListForm({ onSubmit }: AddListFormProps) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  function commit() {
    const trimmed = title.trim();
    if (trimmed === '') {
      setOpen(false);
      return;
    }
    onSubmit(trimmed);
    setTitle('');
    inputRef.current?.focus();
  }

  function cancel() {
    setTitle('');
    setOpen(false);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-full min-h-24 w-full flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-paper-300 text-xs font-medium text-ink-400 transition-colors hover:border-petrol-400 hover:bg-paper-100 hover:text-ink-800"
      >
        <Icon name="plus" className="size-4" />
        {t('list.add')}
      </button>
    );
  }

  return (
    <div className="flex h-fit flex-col rounded-xl bg-paper-100 p-2 ring-1 ring-paper-300/60">
      <input
        ref={inputRef}
        value={title}
        placeholder={t('list.titlePlaceholder')}
        aria-label={t('list.title')}
        onChange={(event) => setTitle(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            commit();
          }
          if (event.key === 'Escape') cancel();
        }}
        className="w-full rounded-lg bg-paper-50 px-2.5 py-2 text-sm text-ink-900 ring-1 ring-paper-300 ring-inset transition placeholder:text-ink-400 focus:ring-petrol-400"
      />
      <div className="mt-1.5 flex items-center gap-1.5">
        <Button size="sm" onClick={commit}>
          {t('common.add')}
        </Button>
        <Button size="sm" variant="ghost" onClick={cancel}>
          {t('common.cancel')}
        </Button>
      </div>
    </div>
  );
}
