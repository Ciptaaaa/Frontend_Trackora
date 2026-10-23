import { useT } from '../../i18n/LocaleContext';
import type { DaySlot } from '../../types/domain';

interface DayCellProps {
  day: DaySlot;
  active: boolean;
  onSelect: (date: string | null) => void;
}
export default function DayCell({ day, active, onSelect }: DayCellProps) {
  const t = useT();
  const load = day.cards.length;
  const ticks = Math.min(load, 4);

  return (
    <button
      type="button"
      onClick={() => onSelect(active ? null : day.date)}
      aria-pressed={active}
      className={`relative flex min-h-16 min-w-11 flex-1 flex-col items-center justify-center gap-1 rounded-lg px-1 py-2 transition-colors duration-150 ${
        active
          ? 'bg-petrol-600 text-onaccent shadow-sm shadow-petrol-600/20'
          : day.isToday
            ? 'bg-petrol-50 text-petrol-700 hover:bg-petrol-200/60'
            : 'text-ink-400 hover:bg-paper-200'
      }`}
    >
      <span className="text-[11px] font-medium tracking-wide">
        {day.weekday}
      </span>

      <span
        className={`text-[15px] leading-none font-semibold tabular-nums ${
          active ? 'text-onaccent' : day.isToday ? 'text-petrol-700' : 'text-ink-600'
        }`}
      >
        {day.dayOfMonth}
      </span>

      <span className="flex h-3 items-end gap-0.5" aria-hidden="true">
        {load === 0 ? (
          <span
            className={`h-0.5 w-4 rounded-full ${active ? 'bg-petrol-200' : 'bg-paper-300'}`}
          />
        ) : (
          Array.from({ length: ticks }, (_, index) => (
            <span
              key={index}
              className={`w-1 rounded-full ${
                active
                  ? 'bg-onaccent'
                  : day.isToday
                    ? 'bg-petrol-600'
                    : 'bg-petrol-400/70'
              }`}
              style={{ height: `${4 + index * 2}px` }}
            />
          ))
        )}
      </span>

      <span className="sr-only">
        {load === 0 ? t('spine.noCards') : t('spine.cardsDue', { count: load })}
      </span>
    </button>
  );
}
