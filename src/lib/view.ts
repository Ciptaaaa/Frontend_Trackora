import { dueStateOf } from './date';
import type { Card } from '../types/domain';

export type BoardView = 'all' | 'due' | 'overdue';

export function applyView(cards: Card[], view: BoardView): Card[] {
  if (view === 'all') return cards;
  if (view === 'due') {
    return cards.filter((card) => dueStateOf(card.due_date) === 'today');
  }
  return cards.filter((card) => dueStateOf(card.due_date) === 'overdue');
}
