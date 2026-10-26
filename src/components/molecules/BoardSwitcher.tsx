import { useRef, useState } from 'react';
import Icon from '../atoms/Icon';
import { useT } from '../../i18n/LocaleContext';
import { useDismissable } from '../../lib/useDismissable';
import type { Board } from '../../types/domain';

interface BoardSwitcherProps {
  boards: Board[];
  activeId: string;
  onSelect: (publicId: string) => void;
  onNewBoard?: () => void;
}

export default function BoardSwitcher({
  boards,
  activeId,
  onSelect,
  onNewBoard,
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
        className="flex min-h-11 min-w-0 items-center gap-2 rounded-lg px-1.5 py-1.5 text-base leading-none font-semibold tracking-[-0.01em] text-ink-900 transition-colors hover:bg-paper-100 sm:px-2 sm:text-lg md:min-h-0"
      >
        {active !== undefined && (
          <span
            className="hidden size-7 shrink-0 items-center justify-center rounded-lg bg-petrol-50 text-[11px] font-semibold text-petrol-700 ring-1 ring-petrol-200 ring-inset sm:flex"
            aria-hidden="true"
          >
            {active.title.charAt(0).toUpperCase()}
          </span>
        )}
        <span className="max-w-[38vw] truncate sm:max-w-none">
          {active?.title ?? t('board.selectBoard')}
        </span>
        <Icon
          name="chevron-down"
          className={`size-4 shrink-0 text-ink-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 z-40 mt-1.5 w-72 max-w-[calc(100vw-3.5rem)] overflow-hidden rounded-xl bg-paper-50 shadow-xl ring-1 ring-paper-300 dark:ring-paper-400">
          {boards.length === 0 ? (
            <p className="px-3.5 py-3 text-xs leading-relaxed text-ink-400">
              {t('board.noBoards')}
            </p>
          ) : (
            <ul
              role="listbox"
              aria-label={t('board.selectBoard')}
              className="max-h-80 overflow-y-auto p-1 scrollbar-slim"
            >
              {boards.map((board) => {
                const selected = board.public_id === activeId;
                return (
                  <li
                    key={board.public_id}
                    role="option"
                    aria-selected={selected}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        onSelect(board.public_id);
                        setOpen(false);
                      }}
                      className={`flex min-h-11 w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors ${
                        selected
                          ? 'bg-petrol-50 text-petrol-700'
                          : 'text-ink-600 hover:bg-paper-100'
                      }`}
                    >
                      <span
                        className={`flex size-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-semibold ${
                          selected
                            ? 'bg-petrol-600 text-onaccent'
                            : 'bg-paper-200 text-ink-600'
                        }`}
                        aria-hidden="true"
                      >
                        {board.title.charAt(0).toUpperCase()}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                          {board.title}
                        </span>
                        {board.description !== '' && (
                          <span className="mt-0.5 block truncate text-xs text-ink-400">
                            {board.description}
                          </span>
                        )}
                      </span>
                      {selected && (
                        <Icon name="check" className="size-4 shrink-0" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {onNewBoard !== undefined && (
            <div className="border-t border-paper-300 p-1">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onNewBoard();
                }}
                className="flex min-h-11 w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm font-medium text-ink-600 transition-colors hover:bg-paper-100 hover:text-ink-900"
              >
                <span
                  className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-dashed border-paper-400 text-ink-400"
                  aria-hidden="true"
                >
                  <Icon name="plus" className="size-3.5" />
                </span>
                {t('board.new')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
