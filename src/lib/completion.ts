import type { Card, List } from '../types/domain';

const DONE_TITLES: ReadonlySet<string> = new Set([
  'selesai',
  'sudah selesai',
  'beres',
  'done',
  'completed',
  'complete',
  'finished',
  '完成',
  '已完成',
]);
function normalise(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, ' ')
    .trim();
}

export function isDoneList(title: string): boolean {
  return DONE_TITLES.has(normalise(title));
}

export function doneListIds(lists: List[]): ReadonlySet<string> {
  return new Set(
    lists.filter((list) => isDoneList(list.title)).map((list) => list.public_id),
  );
}
export function activeCards(cards: Card[], doneIds: ReadonlySet<string>): Card[] {
  return cards.filter((card) => !doneIds.has(card.list_public_id));
}
