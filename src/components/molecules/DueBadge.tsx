import Icon from '../atoms/Icon';
import { useLocale } from '../../i18n/LocaleContext';
import { dueStateOf, formatDueLabel } from '../../lib/date';
import type { DueState } from '../../types/domain';

interface DueBadgeProps {
  dueDate: string | null;
}

const TONES: Record<Exclude<DueState, 'none'>, string> = {
  overdue: 'bg-berry-100 text-berry-700',
  today: 'bg-saffron-100 text-saffron-600',
  soon: 'bg-saffron-100 text-saffron-600',
  upcoming: 'bg-paper-200 text-ink-400',
};

export default function DueBadge({ dueDate }: DueBadgeProps) {
  const { locale, t } = useLocale();
  const state = dueStateOf(dueDate);
  if (state === 'none') return null;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-mono text-[10px] tracking-tight tabular-nums ${TONES[state]}`}
    >
      {state === 'overdue' && <Icon name="alert" className="size-3" />}
      {formatDueLabel(dueDate, locale, t)}
    </span>
  );
}
