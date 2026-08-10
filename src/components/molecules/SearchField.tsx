import { useEffect, useRef } from 'react';
import Icon from '../atoms/Icon';
import { useT } from '../../i18n/LocaleContext';

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
}
export default function SearchField({ value, onChange }: SearchFieldProps) {
  const t = useT();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;

      if (event.key === '/' && !isTyping) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div className="relative w-full max-w-xs">
      <Icon
        name="search"
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-400"
      />
      <input
        ref={inputRef}
        type="search"
        value={value}
        placeholder={t('board.searchCards')}
        aria-label={t('board.searchCards')}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            onChange('');
            event.currentTarget.blur();
          }
        }}
        className="h-9 w-full rounded-lg bg-paper-100 pr-10 pl-9 text-sm text-ink-900 ring-1 ring-paper-300 ring-inset transition placeholder:text-ink-400 hover:bg-paper-50 focus:bg-paper-50"
      />
      {value.length === 0 && (
        <kbd className="pointer-events-none absolute top-1/2 right-2.5 hidden -translate-y-1/2 rounded border border-paper-300 bg-paper-50 px-1.5 py-0.5 font-mono text-[10px] text-ink-400 sm:block">
          /
        </kbd>
      )}
    </div>
  );
}
