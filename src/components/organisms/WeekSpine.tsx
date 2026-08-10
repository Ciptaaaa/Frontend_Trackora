import Icon from '../atoms/Icon';
import DayCell from '../molecules/DayCell';
import { useLocale } from '../../i18n/LocaleContext';
import { formatFullDate, formatMonthRange } from '../../lib/date';
import type { DaySlot } from '../../types/domain';

interface WeekSpineProps {
  days: DaySlot[];
  highlightDate: string | null;
  overdueCount: number;
  highlightedCount: number;
  onHighlightDate: (date: string | null) => void;
}

export default function WeekSpine({
  days,
  highlightDate,
  overdueCount,
  highlightedCount,
  onHighlightDate,
}: WeekSpineProps) {
  const { locale, t } = useLocale();
  const weekTotal = days.reduce((sum, day) => sum + day.cards.length, 0);

  return (
    <section
      aria-label={t('spine.aria')}
      className="shrink-0 border-b border-paper-300/60 bg-paper-100 px-3 py-2.5 sm:px-5"
    >
      <div className="flex items-center gap-3">
        <div className="hidden w-40 shrink-0 flex-col lg:flex">
          <span className="font-display text-[13px] leading-tight font-semibold text-ink-800">
            {t('spine.title')}
          </span>
          <span className="font-mono text-[10px] text-ink-400 tabular-nums">
            {t('spine.summary', {
              month: formatMonthRange(days, locale),
              count: weekTotal,
            })}
          </span>
        </div>

        <div className="flex min-w-0 flex-1 items-stretch gap-1 overflow-x-auto scrollbar-slim">
          {days.map((day) => (
            <DayCell
              key={day.date}
              day={day}
              active={day.date === highlightDate}
              onSelect={onHighlightDate}
            />
          ))}
        </div>
        {overdueCount > 0 && (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-berry-100 px-2 py-1.5 text-[11px] font-medium text-berry-700">
            <Icon name="alert" className="size-3.5" />
            <span className="font-mono tabular-nums">{overdueCount}</span>
            <span className="hidden lg:inline">{t('spine.overdue')}</span>
          </span>
        )}
      </div>
      {highlightDate !== null && (
        <div className="mt-2 flex items-center gap-2 rounded-lg bg-petrol-50 px-3 py-2">
          <Icon name="calendar" className="size-3.5 shrink-0 text-petrol-600" />
          <p className="min-w-0 flex-1 text-[11px] leading-snug text-petrol-700">
            <span className="font-medium">
              {t('spine.highlightActive', {
                date: formatFullDate(highlightDate, locale),
              })}
            </span>
            <span className="text-petrol-600">
              {' · '}
              {highlightedCount === 0
                ? t('spine.highlightNone')
                : t('spine.highlightCount', { count: highlightedCount })}
            </span>
          </p>
          <button
            type="button"
            onClick={() => onHighlightDate(null)}
            className="shrink-0 rounded-md bg-petrol-600 px-2.5 py-1 text-[11px] font-medium text-onaccent transition-colors hover:bg-petrol-700"
          >
            {t('spine.clearHighlight')}
          </button>
        </div>
      )}
    </section>
  );
}
