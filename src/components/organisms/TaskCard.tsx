import type { DragEvent } from 'react';
import Icon from '../atoms/Icon';
import LabelChip from '../atoms/LabelChip';
import AvatarGroup from '../molecules/AvatarGroup';
import DueBadge from '../molecules/DueBadge';
import { useT } from '../../i18n/LocaleContext';
import type { Card } from '../../types/domain';

export type Highlight = 'none' | 'match' | 'muted';

interface TaskCardProps {
  card: Card;
  dragging: boolean;
  done: boolean;
  highlight: Highlight;
  onOpen: (publicId: string) => void;
  onDragStart: (event: DragEvent<HTMLElement>, publicId: string) => void;
  onDragEnd: () => void;
}

const HIGHLIGHT: Record<Highlight, string> = {
  none: 'ring-1 ring-paper-300/80 hover:ring-paper-400 dark:ring-paper-400/60',
  match: 'ring-2 ring-petrol-400 shadow-md shadow-petrol-400/10',
  muted:
    'opacity-45 ring-1 ring-paper-300/80 hover:opacity-100 dark:ring-paper-400/60',
};

export default function TaskCard({
  card,
  dragging,
  done,
  highlight,
  onOpen,
  onDragStart,
  onDragEnd,
}: TaskCardProps) {
  const t = useT();

  return (
    <article
      draggable
      onDragStart={(event) => onDragStart(event, card.public_id)}
      onDragEnd={onDragEnd}
      className={`relative cursor-grab overflow-hidden rounded-lg bg-paper-50 transition-all duration-150 active:cursor-grabbing ${
        HIGHLIGHT[highlight]
      } ${dragging ? 'rotate-1 opacity-40' : ''} ${done ? 'opacity-65' : ''}`}
    >
      <button
        type="button"
        onClick={() => onOpen(card.public_id)}
        className="w-full px-3 py-2.5 text-left"
      >
        {card.labels.length > 0 && (
          <span className="mb-2 flex flex-wrap gap-1">
            {card.labels.map((label) => (
              <LabelChip key={label.public_id} label={label} compact />
            ))}
          </span>
        )}

        <h3
          className={`text-[13px] leading-snug font-medium wrap-break-words ${
            done ? 'text-ink-400 line-through decoration-ink-400/60' : 'text-ink-800'
          }`}
        >
          {card.title}
        </h3>

        {(done ||
          card.due_date !== null ||
          card.attachments.length > 0 ||
          card.assignees.length > 0) && (
          <div className="mt-2.5 flex items-center gap-2">
            {done ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-mint-100 px-1.5 py-0.5 text-[11px] font-medium text-mint-600">
                <Icon name="check" className="size-3" />
                {t('card.done')}
              </span>
            ) : (
              <DueBadge dueDate={card.due_date} />
            )}

            {card.attachments.length > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-ink-400 tabular-nums">
                <Icon name="paperclip" className="size-3" />
                {card.attachments.length}
              </span>
            )}

            <span className="ml-auto">
              <AvatarGroup users={card.assignees} />
            </span>
          </div>
        )}
      </button>
    </article>
  );
}
