import { useCallback, useEffect, useMemo, useState, type DragEvent } from 'react';
import Sidebar from '../organisms/Sidebar';
import Topbar from '../organisms/Topbar';
import WeekSpine from '../organisms/WeekSpine';
import BoardColumn from '../organisms/BoardColumn';
import CardDetail from '../organisms/CardDetail';
import BoardDialog from '../organisms/BoardDialog';
import LabelManager from '../organisms/LabelManager';
import MobileIsland from '../organisms/MobileIsland';
import SettingsDialog from '../organisms/SettingsDialog';
import AddListForm from '../molecules/AddListForm';
import type { NewCardDraft } from '../molecules/AddCardForm';
import ThemeToggle from '../molecules/ThemeToggle';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';
import Spinner from '../atoms/Spinner';
import { useLocale } from '../../i18n/LocaleContext';
import { buildWeekSpine, countOverdue, dueDay, dueStateOf } from '../../lib/date';
import { activeCards, doneListIds } from '../../lib/completion';
import { applyView, type BoardView } from '../../lib/view';
import { describeError, isFatalError } from '../../lib/errors';
import { navigate, type Route } from '../../lib/router';
import {
  getMyBoards,
  getListsOnBoard,
  getCardsForBoard,
  createCard,
  updateCard,
  deleteCard,
  createList,
  updateList,
  deleteList,
  updateListPositions,
} from '../../lib/api';
import type { ThemePreference } from '../../lib/theme';
import type { Board, Card, List, User } from '../../types/domain';

interface AppShellProps {
  user: User;
  route: Route;
  theme: ThemePreference;
  onThemeChange: (preference: ThemePreference) => void;
  onUserUpdate: (user: User) => void;
  onLogout: () => void;
}

export default function AppShell({
  user,
  route,
  theme,
  onThemeChange,
  onUserUpdate,
  onLogout,
}: AppShellProps) {
  const { locale, t } = useLocale();
  const [boards, setBoards] = useState<Board[]>([]);
  const [lists, setLists] = useState<List[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [boardLoading, setBoardLoading] = useState(false);
  const [loadedBoardId, setLoadedBoardId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [highlightDate, setHighlightDate] = useState<string | null>(null);
  const [view, setView] = useState<BoardView>('all');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [railExpanded, setRailExpanded] = useState(false);
  const [boardDialog, setBoardDialog] = useState<Board | 'new' | null>(null);
  const [labelManagerOpen, setLabelManagerOpen] = useState(false);
  const [dataVersion, setDataVersion] = useState(0);

  const navOpen = drawerOpen || railExpanded;

  const activeBoardId =
    route.name === 'board' || route.name === 'card' ? route.boardId : '';
  const openCardId = route.name === 'card' ? route.cardId : null;

  const errorMessage = useCallback(
    (caught: unknown): string => describeError(caught, t),
    [t],
  );

  const openBoard = useCallback((boardId: string) => {
    navigate({ name: 'board', boardId });
  }, []);
  const closeCard = useCallback(() => {
    if (route.name !== 'card') return;
    navigate({ name: 'board', boardId: route.boardId }, { replace: true });
  }, [route]);

  const openCard = useCallback(
    (cardId: string) => {
      if (activeBoardId === '') return;
      navigate({ name: 'card', boardId: activeBoardId, cardId });
    },
    [activeBoardId],
  );
  useEffect(() => {
    let cancelled = false;

    async function loadBoards() {
      try {
        const data = await getMyBoards();
        if (cancelled) return;
        setBoards(data);
      } catch (caught) {
        if (!cancelled) setLoadError(errorMessage(caught));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadBoards();
    return () => {
      cancelled = true;
    };
  }, [errorMessage]);
  useEffect(() => {
    if (loading || boards.length === 0) return;

    const first = boards[0];
    if (first === undefined) return;

    if (route.name === 'boards') {
      navigate({ name: 'board', boardId: first.public_id }, { replace: true });
      return;
    }

    const known = boards.some((board) => board.public_id === activeBoardId);
    if (!known) {
      navigate({ name: 'board', boardId: first.public_id }, { replace: true });
    }
  }, [loading, boards, route.name, activeBoardId]);
  useEffect(() => {
    if (activeBoardId === '') return;
    let cancelled = false;

    async function loadBoardData() {
      setBoardLoading(true);
      try {
        const fetchedLists = await getListsOnBoard(activeBoardId);
        if (cancelled) return;
        setLists(fetchedLists);

        const fetchedCards =
          fetchedLists.length === 0 ? [] : await getCardsForBoard(fetchedLists);
        if (cancelled) return;
        setCards(fetchedCards);
        setLoadedBoardId(activeBoardId);
        setLoadError(null);
      } catch (caught) {
        if (cancelled) return;
        setLists([]);
        setCards([]);
        setLoadedBoardId(activeBoardId);
        const fatal = isFatalError(caught);
        setLoadError(fatal ? errorMessage(caught) : null);
      } finally {
        if (!cancelled) setBoardLoading(false);
      }
    }

    loadBoardData();
    return () => {
      cancelled = true;
    };
  }, [activeBoardId, dataVersion, errorMessage]);

  useEffect(() => {
    if (!navOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      setDrawerOpen(false);
      setRailExpanded(false);
    }
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [navOpen]);
  const boardLists = lists;

  const boardCards = useMemo(() => {
    const listIds = new Set(boardLists.map((list) => list.public_id));
    return cards.filter((card) => listIds.has(card.list_public_id));
  }, [cards, boardLists]);
  const openCards = useMemo(() => {
    const doneIds = doneListIds(boardLists);
    return activeCards(boardCards, doneIds);
  }, [boardCards, boardLists]);

  const weekDays = useMemo(
    () => buildWeekSpine(openCards, locale),
    [openCards, locale],
  );

  const searchedCards = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (needle.length === 0) return boardCards;

    return boardCards.filter(
      (card) =>
        card.title.toLowerCase().includes(needle) ||
        card.description.toLowerCase().includes(needle) ||
        card.labels.some((label) => label.name.toLowerCase().includes(needle)),
    );
  }, [boardCards, query]);
  const visibleCards = useMemo(() => {
    if (view === 'all') return searchedCards;
    const openIds = new Set(openCards.map((card) => card.public_id));
    return applyView(
      searchedCards.filter((card) => openIds.has(card.public_id)),
      view,
    );
  }, [searchedCards, openCards, view]);

  const dueTodayCount = useMemo(
    () => openCards.filter((card) => dueStateOf(card.due_date) === 'today').length,
    [openCards],
  );
  const overdueCount = useMemo(() => countOverdue(openCards), [openCards]);
  const highlightedCount = useMemo(
    () =>
      highlightDate === null
        ? 0
        : visibleCards.filter((card) => dueDay(card.due_date) === highlightDate).length,
    [visibleCards, highlightDate],
  );

  const filtering = query.trim().length > 0 || view !== 'all';
  const openCardData = cards.find((card) => card.public_id === openCardId) ?? null;
  const activeBoard = boards.find((board) => board.public_id === activeBoardId) ?? null;
  useEffect(() => {
    if (openCardId === null) return;
    if (boardLoading || loadedBoardId !== activeBoardId) return;
    if (openCardData === null) closeCard();
  }, [boardLoading, loadedBoardId, activeBoardId, openCardId, openCardData, closeCard]);

  function handleDragStart(event: DragEvent<HTMLElement>, publicId: string) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', publicId);
    setDraggingId(publicId);
  }
  async function handleDropCard(listId: string) {
    if (draggingId === null) return;
    setDraggingId(null);

    const card = cards.find((item) => item.public_id === draggingId);
    if (card === undefined || card.list_public_id === listId) return;

    const position = cards.filter((item) => item.list_public_id === listId).length;

    setCards((current) =>
      current.map((item) =>
        item.public_id === card.public_id
          ? { ...item, list_public_id: listId, position }
          : item,
      ),
    );

    try {
      await updateCard(card.public_id, {
        list_public_id: listId,
        title: card.title,
        description: card.description,
        due_date: card.due_date,
        position,
      });
    } catch (caught) {
      setCards((current) =>
        current.map((item) => (item.public_id === card.public_id ? card : item)),
      );
      setLoadError(errorMessage(caught));
    }
  }
  async function handleAddCard(listId: string, draft: NewCardDraft) {
    try {
      const newCard = await createCard({
        list_public_id: listId,
        title: draft.title,
        description: draft.description,
        due_date: draft.due_date,
        position: cards.filter((c) => c.list_public_id === listId).length,
      });
      setCards((current) => [...current, newCard]);
    } catch (caught) {
      setLoadError(errorMessage(caught));
    }
  }

  async function handleDeleteCard(cardPublicId: string) {
    setDeleting(true);
    try {
      await deleteCard(cardPublicId);
      setCards((current) => current.filter((card) => card.public_id !== cardPublicId));
      closeCard();
    } catch (caught) {
      setLoadError(errorMessage(caught));
    } finally {
      setDeleting(false);
    }
  }

  async function handleCreateList(title: string) {
    if (activeBoardId === '') return;
    try {
      const created = await createList({
        board_public_id: activeBoardId,
        title,
      });
      setLists((current) => [...current, { ...created, position: current.length }]);
    } catch (caught) {
      setLoadError(errorMessage(caught));
    }
  }

  async function handleRenameList(listId: string, title: string) {
    const previous = lists.find((list) => list.public_id === listId);
    if (previous === undefined) return;

    setLists((current) =>
      current.map((list) => (list.public_id === listId ? { ...list, title } : list)),
    );

    try {
      await updateList(listId, { title });
    } catch (caught) {
      setLists((current) =>
        current.map((list) => (list.public_id === listId ? previous : list)),
      );
      setLoadError(errorMessage(caught));
    }
  }

  async function handleDeleteList(listId: string) {
    try {
      await deleteList(listId);
      setLists((current) => current.filter((list) => list.public_id !== listId));
      setCards((current) => current.filter((card) => card.list_public_id !== listId));
    } catch (caught) {
      setLoadError(errorMessage(caught));
    }
  }
  async function handleMoveList(listId: string, offset: -1 | 1) {
    const from = lists.findIndex((list) => list.public_id === listId);
    const to = from + offset;
    if (from === -1 || to < 0 || to >= lists.length) return;

    const moving = lists[from];
    const target = lists[to];
    if (moving === undefined || target === undefined) return;

    const reordered = lists.filter((_, index) => index !== from);
    reordered.splice(to, 0, moving);

    const previous = lists;
    setLists(reordered.map((list, index) => ({ ...list, position: index })));

    try {
      await updateListPositions(
        activeBoardId,
        reordered.map((list) => list.public_id),
      );
    } catch (caught) {
      setLists(previous);
      setLoadError(errorMessage(caught));
    }
  }

  function handleBoardSaved(saved: Board) {
    const exists = boards.some((board) => board.public_id === saved.public_id);
    setBoards((current) =>
      exists
        ? current.map((board) => (board.public_id === saved.public_id ? saved : board))
        : [...current, saved],
    );
    if (!exists) openBoard(saved.public_id);
  }
  function handleCardUpdate(updated: Card) {
    setCards((current) =>
      current.map((card) => (card.public_id === updated.public_id ? updated : card)),
    );
  }

  const sidebarProps = {
    boards,
    activeBoardId,
    cards: openCards,
    user,
    view,
    theme,
    onViewChange: setView,
    onThemeChange,
    onOpenSettings: () => {
      setSettingsOpen(true);
      closeNav();
    },
    onLogout,
    onNewBoard: () => setBoardDialog('new'),
  };

  function closeNav() {
    setDrawerOpen(false);
    setRailExpanded(false);
  }

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-paper-100">
        <Spinner label={t('app.loading')} />
      </div>
    );
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-paper-200 text-ink-800">
      <div className="hidden shrink-0 md:block lg:hidden">
        <Sidebar
          variant="rail"
          {...sidebarProps}
          onSelectBoard={openBoard}
          onExpand={() => setRailExpanded(true)}
        />
      </div>
      <div className="hidden shrink-0 lg:block">
        <Sidebar variant="full" {...sidebarProps} onSelectBoard={openBoard} />
      </div>
      {railExpanded && (
        <div className="fixed inset-0 z-50 hidden md:block lg:hidden">
          <div
            className="absolute inset-0 bg-scrim backdrop-blur-[2px]"
            onClick={closeNav}
            aria-hidden="true"
          />
          <div className="relative h-full w-64 shadow-2xl">
            <Sidebar
              variant="drawer"
              {...sidebarProps}
              onSelectBoard={(id) => {
                openBoard(id);
                setRailExpanded(false);
              }}
              onClose={closeNav}
            />
          </div>
        </div>
      )}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-scrim backdrop-blur-[2px]"
            onClick={closeNav}
            aria-hidden="true"
          />
          <div className="relative flex h-full w-64 max-w-[82vw] flex-col shadow-2xl">
            <Sidebar
              variant="drawer"
              {...sidebarProps}
              onSelectBoard={(id) => {
                openBoard(id);
                setDrawerOpen(false);
              }}
              onClose={closeNav}
            />
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 border-t border-nav-border bg-nav-surface px-3 py-3">
              <span className="text-[11px] font-medium text-nav-muted">
                {t('theme.label')}
              </span>
              <ThemeToggle preference={theme} onChange={onThemeChange} tone="inverse" />
            </div>
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          boards={boards}
          activeBoardId={activeBoardId}
          user={user}
          query={query}
          cardCount={boardCards.length}
          theme={theme}
          onSelectBoard={openBoard}
          onQueryChange={setQuery}
          onOpenMenu={() => setDrawerOpen(true)}
          onOpenSettings={() => setSettingsOpen(true)}
          onLogout={onLogout}
          onThemeChange={onThemeChange}
          onNewBoard={() => setBoardDialog('new')}
          onEditBoard={activeBoard === null ? null : () => setBoardDialog(activeBoard)}
          onManageLabels={() => setLabelManagerOpen(true)}
        />
        <div className="border-b border-paper-300/60 bg-paper-50 px-3 py-2 sm:hidden">
          <input
            type="search"
            value={query}
            placeholder={t('board.searchCards')}
            aria-label={t('board.searchCards')}
            onChange={(event) => setQuery(event.target.value)}
            className="h-9 w-full rounded-lg bg-paper-100 px-3 text-sm text-ink-900 ring-1 ring-paper-300 ring-inset placeholder:text-ink-400"
          />
        </div>

        {loadError !== null && (
          <p
            role="alert"
            className="border-b border-berry-500/25 bg-berry-100 px-4 py-2.5 text-xs leading-relaxed text-berry-700"
          >
            {loadError}
          </p>
        )}

        <WeekSpine
          days={weekDays}
          highlightDate={highlightDate}
          overdueCount={overdueCount}
          highlightedCount={highlightedCount}
          onHighlightDate={setHighlightDate}
        />
        {view !== 'all' && (
          <div className="flex items-center gap-2 border-b border-petrol-200 bg-petrol-50 px-3 py-2 sm:px-4">
            <Icon
              name={view === 'due' ? 'calendar' : 'alert'}
              className="size-3.5 shrink-0 text-petrol-700"
            />
            <p className="min-w-0 flex-1 truncate text-xs text-petrol-900">
              {t(view === 'due' ? 'view.activeDue' : 'view.activeOverdue')}
            </p>
            <button
              type="button"
              onClick={() => setView('all')}
              className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-petrol-700 transition-colors hover:bg-petrol-200"
            >
              {t('view.clear')}
            </button>
          </div>
        )}

        {boardLoading ? (
          <div className="flex min-h-0 flex-1 items-center justify-center p-6">
            <Spinner label={t('app.loading')} />
          </div>
        ) : boards.length === 0 ? (
          <div className="flex min-h-0 flex-1 items-center justify-center p-6">
            <div className="flex max-w-xs flex-col items-center gap-3 text-center">
              <p className="text-sm leading-relaxed text-ink-400">
                {t('board.noBoards')}
              </p>
              <Button size="sm" onClick={() => setBoardDialog('new')}>
                {t('board.new')}
              </Button>
            </div>
          </div>
        ) : boardLists.length === 0 ? (
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 p-6 pb-24 md:pb-6">
            <p className="max-w-xs text-center text-sm leading-relaxed text-ink-400">
              {t('board.noLists')}
            </p>
            <div className="w-70">
              <AddListForm onSubmit={handleCreateList} />
            </div>
          </div>
        ) : view !== 'all' && visibleCards.length === 0 ? (
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 p-6 pb-24 md:pb-6">
            <p className="max-w-xs text-center text-sm leading-relaxed text-ink-400">
              {t(view === 'due' ? 'view.dueEmpty' : 'view.overdueEmpty')}
            </p>
            <Button variant="secondary" size="sm" onClick={() => setView('all')}>
              {t('view.clear')}
            </Button>
          </div>
        ) : (
          <main className="min-h-0 flex-1 overflow-x-auto overflow-y-hidden overscroll-x-none scrollbar-slim">
            <div className="grid h-full w-max auto-cols-70 grid-flow-col gap-3 px-3 pt-3 pb-20 sm:px-4 sm:pt-4 md:pb-4 lg:auto-cols-74">
              {boardLists.map((list, index) => (
                <BoardColumn
                  key={list.public_id}
                  list={list}
                  cards={visibleCards
                    .filter((card) => card.list_public_id === list.public_id)
                    .sort((a, b) => a.position - b.position)}
                  draggingId={draggingId}
                  filtered={filtering}
                  highlightDate={highlightDate}
                  index={index}
                  total={boardLists.length}
                  onOpenCard={openCard}
                  onAddCard={handleAddCard}
                  onDropCard={handleDropCard}
                  onDragStart={handleDragStart}
                  onDragEnd={() => setDraggingId(null)}
                  onRenameList={handleRenameList}
                  onDeleteList={handleDeleteList}
                  onMoveList={handleMoveList}
                />
              ))}
              <AddListForm onSubmit={handleCreateList} />
            </div>
          </main>
        )}
      </div>

      <MobileIsland
        view={view}
        dueCount={dueTodayCount}
        overdueCount={overdueCount}
        user={user}
        theme={theme}
        onViewChange={setView}
        onThemeChange={onThemeChange}
        onOpenSettings={() => setSettingsOpen(true)}
        onLogout={onLogout}
      />

      <SettingsDialog
        open={settingsOpen}
        user={user}
        theme={theme}
        onClose={() => setSettingsOpen(false)}
        onThemeChange={onThemeChange}
        onSaved={onUserUpdate}
        onLogout={onLogout}
      />

      <CardDetail
        card={openCardData}
        list={boardLists.find(
          (list) => list.public_id === openCardData?.list_public_id,
        )}
        onClose={closeCard}
        onDelete={handleDeleteCard}
        onUpdate={handleCardUpdate}
        deleting={deleting}
      />

      <BoardDialog
        open={boardDialog !== null}
        board={boardDialog === 'new' ? null : boardDialog}
        onClose={() => setBoardDialog(null)}
        onSaved={handleBoardSaved}
      />

      <LabelManager
        open={labelManagerOpen}
        onClose={() => setLabelManagerOpen(false)}
        onChanged={() => setDataVersion((version) => version + 1)}
      />
    </div>
  );
}
