import type { Card, DaySlot, DueState } from '../types/domain';
import type { Locale, Translate } from '../i18n';
const INTL_LOCALES: Record<Locale, string> = {
  id: 'id-ID',
  en: 'en-GB',
  zh: 'zh-CN',
};

export function toISODate(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}
export function toApiDate(inputValue: string): string | null {
  return inputValue === '' ? null : `${inputValue}T12:00:00Z`;
}
export function dueDay(dueDate: string | null): string | null {
  return dueDate === null ? null : dueDate.slice(0, 10);
}
export function toInputDate(apiValue: string | null): string {
  if (apiValue === null) return '';
  const day = apiValue.slice(0, 10);
  return day === '0001-01-01' ? '' : day;
}

export function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function daysFromToday(iso: string): number {
  const target = new Date(`${iso.slice(0, 10)}T00:00:00`);
  return Math.round((target.getTime() - startOfToday().getTime()) / 86_400_000);
}

export function dueStateOf(dueDate: string | null): DueState {
  if (dueDate === null) return 'none';
  const offset = daysFromToday(dueDate);
  if (offset < 0) return 'overdue';
  if (offset === 0) return 'today';
  if (offset <= 2) return 'soon';
  return 'upcoming';
}

export function formatDueLabel(
  dueDate: string | null,
  locale: Locale,
  t: Translate,
): string {
  if (dueDate === null) return '';
  const offset = daysFromToday(dueDate);

  if (offset === 0) return t('due.today');
  if (offset === 1) return t('due.tomorrow');
  if (offset === -1) return t('due.yesterday');
  if (offset < 0) return t('due.daysAgo', { count: Math.abs(offset) });
  if (offset <= 6) return t('due.inDays', { count: offset });

  return new Date(`${dueDate.slice(0, 10)}T00:00:00`).toLocaleDateString(
    INTL_LOCALES[locale],
    { day: 'numeric', month: 'short' },
  );
}

export function formatFullDate(iso: string, locale: Locale): string {
  return new Date(`${iso.slice(0, 10)}T00:00:00`).toLocaleDateString(
    INTL_LOCALES[locale],
    { weekday: 'long', day: 'numeric', month: 'short' },
  );
}

export function formatMonthRange(days: DaySlot[], locale: Locale): string {
  if (days.length === 0) return '';

  const intlLocale = INTL_LOCALES[locale];
  const firstDay = days[0];
  const lastDay = days[days.length - 1];
  if (firstDay === undefined || lastDay === undefined) return '';

  const first = new Date(`${firstDay.date}T00:00:00`);
  const last = new Date(`${lastDay.date}T00:00:00`);
  const firstMonth = first.toLocaleDateString(intlLocale, { month: 'short' });
  const lastMonth = last.toLocaleDateString(intlLocale, { month: 'short' });

  return firstMonth === lastMonth
    ? `${firstMonth} ${first.getFullYear()}`
    : `${firstMonth} – ${lastMonth} ${last.getFullYear()}`;
}

export function buildWeekSpine(cards: Card[], locale: Locale, length = 7): DaySlot[] {
  const today = startOfToday();
  const todayISO = toISODate(today);
  const intlLocale = INTL_LOCALES[locale];

  return Array.from({ length }, (_, offset): DaySlot => {
    const date = new Date(today);
    date.setDate(today.getDate() + offset);
    const iso = toISODate(date);
    const weekdayIndex = date.getDay();

    return {
      date: iso,
      weekday: date.toLocaleDateString(intlLocale, { weekday: 'short' }),
      dayOfMonth: date.getDate(),
      isToday: iso === todayISO,
      isWeekend: weekdayIndex === 0 || weekdayIndex === 6,
      cards: cards.filter((card) => dueDay(card.due_date) === iso),
    };
  });
}

export function countOverdue(cards: Card[]): number {
  return cards.filter((card) => dueStateOf(card.due_date) === 'overdue').length;
}
