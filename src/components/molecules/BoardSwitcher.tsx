import { useRef, useState } from 'react';
import Icon from '../atoms/Icon';
import { useT } from '../../i18n/LocaleContext';
import { useDismissable } from '../../lib/useDismissable';
import type { Board } from '../../types/domain';

interface BoardSwitcherProps {
  boards: Board[];
  activeId: string;
  onSelect: (publicId: string) => void;
}

export default function BoardSwitcher({
  boards,
  activeId,
  onSelect,
}: BoardSwitcherProps) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const active = boards.find((board) => board.public_id === activeId);

  useDismissable(open, rootRef, () => setOpen(false));

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex items-center gap-1.5 rounded-lg px-2 py-1 font-display text-lg leading-none font-semibold tracking-tight text-ink-900 transition-colors hover:bg-paper-200 sm:text-xl"
      >
        <span className="max-w-[40vw] truncate sm:max-w-none">
          {active?.title ?? t('board.selectBoard')}
        </span>
        <Icon
          name="chevron-down"
          className={`size-4 shrink-0 text-ink-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t('board.selectBoard')}
          className="absolute top-full left-0 z-40 mt-1.5 w-64 overflow-hidden rounded-xl bg-paper-50 p-1 shadow-lg ring-1 ring-paper-300"
        >
          {boards.map((board) => (
            <li
              key={board.public_id}
              role="option"
              aria-selected={board.public_id === activeId}
            >
              <button
                type="button"
                onClick={() => {
                  onSelect(board.public_id);
                  setOpen(false);
                }}
                className={`w-full rounded-lg px-3 py-2 text-left transition-colors ${
                  board.public_id === activeId
                    ? 'bg-petrol-50 text-petrol-600'
                    : 'text-ink-600 hover:bg-paper-100'
                }`}
              >
                <span className="block text-sm font-medium">{board.title}</span>
                <span className="mt-0.5 block truncate text-xs text-ink-400">
                  {board.description}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
