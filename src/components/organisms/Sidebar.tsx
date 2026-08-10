import Logo from '../atoms/Logo';
import Avatar from '../atoms/Avatar';
import Icon from '../atoms/Icon';
import IconButton from '../atoms/IconButton';
import NavItem from '../molecules/NavItem';
import AccountMenu from './AccountMenu';
import { useT } from '../../i18n/LocaleContext';
import { countOverdue, dueStateOf } from '../../lib/date';
import type { BoardView } from '../../lib/view';
import type { ThemePreference } from '../../lib/theme';
import type { Board, Card, User } from '../../types/domain';

export type SidebarVariant = 'rail' | 'full' | 'drawer';

interface SidebarProps {
  variant: SidebarVariant;
  boards: Board[];
  activeBoardId: string;
  cards: Card[];
  user: User;
  view: BoardView;
  theme: ThemePreference;
  onSelectBoard: (publicId: string) => void;
  onViewChange: (view: BoardView) => void;
  onThemeChange: (preference: ThemePreference) => void;
  onOpenSettings: () => void;
  onLogout: () => void;
  onNewBoard: () => void;
  onExpand?: () => void;
  onClose?: () => void;
}

export default function Sidebar({
  variant,
  boards,
  activeBoardId,
  cards,
  user,
  view,
  theme,
  onSelectBoard,
  onViewChange,
  onThemeChange,
  onOpenSettings,
  onLogout,
  onNewBoard,
  onExpand,
  onClose,
}: SidebarProps) {
  const t = useT();
  const overdue = countOverdue(cards);
  const dueToday = cards.filter((card) => dueStateOf(card.due_date) === 'today').length;
  const compact = variant === 'rail';
  function toggleView(next: BoardView) {
    onViewChange(view === next ? 'all' : next);
  }

  return (
    <nav
      aria-label={t('nav.main')}
      className={`flex h-full flex-col bg-nav-surface ${compact ? 'w-16 items-center' : 'w-64'}`}
    >
      <div
        className={`flex h-14 shrink-0 items-center ${compact ? 'justify-center' : 'justify-between px-4'}`}
      >
        {compact && onExpand !== undefined ? (
          <button
            type="button"
            onClick={onExpand}
            aria-label={t('nav.expand')}
            title={t('nav.expand')}
            className="rounded-lg p-1 transition-colors hover:bg-nav-raised"
          >
            <Logo markOnly tone="inverse" />
          </button>
        ) : (
          <Logo markOnly={compact} tone="inverse" />
        )}

        {variant === 'drawer' && onClose !== undefined && (
          <IconButton
            icon="close"
            label={t('nav.closeMenu')}
            tone="inverse"
            onClick={onClose}
          />
        )}
      </div>

      <div className={`flex w-full flex-col gap-0.5 ${compact ? 'px-2' : 'px-3'}`}>
        <NavItem
          icon="board"
          label={t('nav.board')}
          active={view === 'all'}
          collapsed={compact}
          onClick={() => onViewChange('all')}
        />
        <NavItem
          icon="calendar"
          label={t('nav.due')}
          count={dueToday}
          active={view === 'due'}
          collapsed={compact}
          onClick={() => toggleView('due')}
        />
        <NavItem
          icon="alert"
          label={t('nav.overdue')}
          count={overdue}
          active={view === 'overdue'}
          collapsed={compact}
          onClick={() => toggleView('overdue')}
        />
      </div>

      {compact ? (
        <div className="mt-5 flex w-full flex-col items-center gap-2 border-t border-nav-border pt-4">
          {boards.map((board) => {
            const active = board.public_id === activeBoardId;
            return (
              <button
                key={board.public_id}
                type="button"
                onClick={() => onSelectBoard(board.public_id)}
                title={board.title}
                aria-label={board.title}
                aria-current={active ? 'true' : undefined}
                className={`flex size-9 items-center justify-center rounded-lg font-display text-xs font-semibold transition-colors ${
                  active
                    ? 'bg-nav-accent text-nav-text'
                    : 'text-nav-muted hover:bg-nav-raised hover:text-nav-text'
                }`}
              >
                {board.title.charAt(0).toUpperCase()}
              </button>
            );
          })}
          <button
            type="button"
            onClick={onNewBoard}
            title={t('board.new')}
            aria-label={t('board.new')}
            className="flex size-9 items-center justify-center rounded-lg border border-dashed border-nav-border text-nav-muted transition-colors hover:bg-nav-raised hover:text-nav-text"
          >
            <Icon name="plus" className="size-4" />
          </button>
        </div>
      ) : (
        <div className="mt-6 min-h-0 w-full flex-1 overflow-y-auto px-3 scrollbar-slim">
          <div className="mb-2 flex items-center justify-between gap-2 pr-0.5 pl-2.5">
            <h2 className="text-[10px] font-semibold tracking-[0.08em] text-nav-muted uppercase">
              {t('nav.myBoards')}
            </h2>
            <IconButton
              icon="plus"
              label={t('board.new')}
              tone="inverse"
              onClick={onNewBoard}
              className="size-7"
            />
          </div>
          <ul className="flex flex-col gap-0.5">
            {boards.map((board) => (
              <li key={board.public_id}>
                <button
                  type="button"
                  onClick={() => onSelectBoard(board.public_id)}
                  aria-current={board.public_id === activeBoardId ? 'true' : undefined}
                  className={`flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-[13px] transition-colors ${
                    board.public_id === activeBoardId
                      ? 'bg-nav-raised font-medium text-nav-text'
                      : 'text-nav-muted hover:bg-nav-raised/60 hover:text-nav-text'
                  }`}
                >
                  <span
                    className="size-1.5 shrink-0 rounded-full bg-saffron-400"
                    aria-hidden="true"
                  />
                  <span className="truncate">{board.title}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div
        className={`mt-auto flex w-full shrink-0 flex-col gap-1 border-t border-nav-border py-3 ${
          compact ? 'items-center px-2' : 'px-3'
        }`}
      >
        <NavItem
          icon="settings"
          label={t('nav.settings')}
          collapsed={compact}
          onClick={onOpenSettings}
        />
        <AccountMenu
          user={user}
          theme={theme}
          placement="up"
          align={compact ? 'start' : 'end'}
          tone="inverse"
          triggerClassName={
            compact
              ? 'rounded-lg p-0.5'
              : 'mt-1 w-full rounded-lg px-2 py-1.5 text-left'
          }
          onThemeChange={onThemeChange}
          onOpenSettings={onOpenSettings}
          onLogout={onLogout}
        >
          {compact ? (
            <Avatar user={user} size="sm" tone="inverse" />
          ) : (
            <>
              <Avatar user={user} size="sm" tone="inverse" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-medium text-nav-text">
                  {user.name}
                </span>
                <span className="block truncate text-[10px] text-nav-muted">
                  {user.email}
                </span>
              </span>
              <Icon name="chevron-down" className="size-4 shrink-0" />
            </>
          )}
        </AccountMenu>
      </div>
    </nav>
  );
}
