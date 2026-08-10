import { useEffect, useRef, useState, type DragEvent } from 'react';
import Icon from '../atoms/Icon';
import IconButton from '../atoms/IconButton';
import MenuPopover, { type MenuAction } from '../molecules/MenuPopover';
import AddCardForm, { type NewCardDraft } from '../molecules/AddCardForm';
import TaskCard, { type Highlight } from './TaskCard';
import { useT } from '../../i18n/LocaleContext';
import { countOverdue, dueDay } from '../../lib/date';
import { isDoneList } from '../../lib/completion';
import type { Card, List } from '../../types/domain';

interface BoardColumnProps {
  list: List;
  cards: Card[];
  draggingId: string | null;
  filtered: boolean;
  highlightDate: string | null;
  index: number;
  total: number;
  onOpenCard: (publicId: string) => void;
  onAddCard: (listId: string, draft: NewCardDraft) => void;
  onDropCard: (listId: string) => void;
  onDragStart: (event: DragEvent<HTMLElement>, publicId: string) => void;
  onDragEnd: () => void;
  onRenameList: (listId: string, title: string) => void;
  onDeleteList: (listId: string) => void;
  onMoveList: (listId: string, offset: -1 | 1) => void;
}

export default function BoardColumn({
  list,
  cards,
  draggingId,
  filtered,
  highlightDate,
  index,
  total,
  onOpenCard,
  onAddCard,
  onDropCard,
  onDragStart,
  onDragEnd,
  onRenameList,
  onDeleteList,
  onMoveList,
}: BoardColumnProps) {
  const t = useT();
  const [over, setOver] = useState(false);
  const [adding, setAdding] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState(list.title);
  const renameRef = useRef<HTMLInputElement>(null);
  
  const done = isDoneList(list.title);
  const overdue = done ? 0 : countOverdue(cards);
  const matches =
    highlightDate === null
      ? 0
      : cards.filter((card) => dueDay(card.due_date) === highlightDate).length;

  function highlightOf(card: Card): Highlight {
    if (highlightDate === null) return 'none';
    return dueDay(card.due_date) === highlightDate ? 'match' : 'muted';
  }

  useEffect(() => {
    if (renaming) {
      renameRef.current?.focus();
      renameRef.current?.select();
    }
  }, [renaming]);

  function handleDragOver(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setOver(true);
  }

  function commitRename() {
    const trimmed = draft.trim();
    setRenaming(false);
    if (trimmed === '' || trimmed === list.title) {
      setDraft(list.title);
      return;
    }
    onRenameList(list.public_id, trimmed);
  }

  const actions: MenuAction[] = [
    {
      id: 'rename',
      label: t('list.rename'),
      icon: 'pencil',
      onSelect: () => {
        setDraft(list.title);
        setRenaming(true);
      },
    },
    {
      id: 'move-left',
      label: t('list.moveLeft'),
      icon: 'chevron-left',
      disabled: index === 0,
      onSelect: () => onMoveList(list.public_id, -1),
    },
    {
      id: 'move-right',
      label: t('list.moveRight'),
      icon: 'chevron-right',
      disabled: index === total - 1,
      onSelect: () => onMoveList(list.public_id, 1),
    },
    {
      id: 'delete',
      label: t('list.delete'),
      icon: 'trash',
      tone: 'danger',
      onSelect: () => {
        if (window.confirm(t('list.deleteConfirm'))) onDeleteList(list.public_id);
      },
    },
  ];

  return (
    <section
      aria-label={list.title}
      onDragOver={handleDragOver}
      onDragLeave={() => setOver(false)}
      onDrop={() => {
        setOver(false);
        onDropCard(list.public_id);
      }}
      className={`flex h-full max-h-full min-w-0 flex-col rounded-xl transition-colors duration-150 ${
        over && draggingId !== null
          ? 'bg-petrol-50 ring-2 ring-petrol-400'
          : 'bg-paper-100 ring-1 ring-paper-300/60'
      }`}
    >
      <header className="flex shrink-0 items-center gap-2 px-3 py-2.5">
        {renaming ? (
          <input
            ref={renameRef}
            value={draft}
            aria-label={t('list.title')}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={commitRename}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                commitRename();
              }
              if (event.key === 'Escape') {
                setDraft(list.title);
                setRenaming(false);
              }
            }}
            className="min-w-0 flex-1 rounded-md bg-paper-50 px-1.5 py-0.5 text-[13px] font-semibold tracking-tight text-ink-900 ring-1 ring-petrol-400 focus:outline-none"
          />
        ) : (
          <>
            {done && (
              <Icon
                name="check"
                className="size-3.5 shrink-0 text-petrol-600"
                aria-hidden="true"
              />
            )}
            <h2 className="min-w-0 truncate text-[13px] font-semibold tracking-tight text-ink-800">
              {list.title}
            </h2>
            <span className="font-mono text-[11px] text-ink-400 tabular-nums">
              {cards.length}
            </span>
            {overdue > 0 && (
              <span
                className="size-1.5 rounded-full bg-berry-500"
                title={t('column.overdueCount', { count: overdue })}
              >
                <span className="sr-only">
                  {t('column.overdueCount', { count: overdue })}
                </span>
              </span>
            )}
            {matches > 0 && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-petrol-600 px-1.5 py-0.5 font-mono text-[10px] font-medium text-onaccent tabular-nums">
                {matches}
                <span className="sr-only">
                  {t('column.highlightCount', { count: matches })}
                </span>
              </span>
            )}
          </>
        )}

        <div className="ml-auto flex shrink-0 items-center">
          <IconButton
            icon="plus"
            label={t('column.addTo', { list: list.title })}
            onClick={() => setAdding(true)}
            className="size-7"
          />
          <MenuPopover
            label={t('list.actions', { list: list.title })}
            actions={actions}
          />
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-2 pb-2 scrollbar-slim">
        {cards.map((card) => (
          <TaskCard
            key={card.public_id}
            card={card}
            dragging={card.public_id === draggingId}
            done={done}
            highlight={highlightOf(card)}
            onOpen={onOpenCard}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          />
        ))}

        {cards.length === 0 && (
          <p className="rounded-lg border border-dashed border-paper-300 px-3 py-6 text-center text-[11px] leading-relaxed text-ink-400">
            {filtered ? t('column.emptyFiltered') : t('column.empty')}
          </p>
        )}

        <AddCardForm
          open={adding}
          onOpenChange={setAdding}
          onSubmit={(draft) => onAddCard(list.public_id, draft)}
        />
      </div>
    </section>
  );
}
