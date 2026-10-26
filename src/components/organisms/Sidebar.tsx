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
      className={`flex h-full flex-col border-r border-nav-border bg-nav-surface text-nav-text ${
        compact ? 'w-16 items-center' : 'w-64'
      }`}
    >
      <div
        className={`flex h-14 shrink-0 items-center ${
          compact ? 'justify-center' : 'justify-between px-3'
        }`}
      >
        {compact && onExpand !== undefined ? (
          <button
            type="button"
            onClick={onExpand}
            aria-label={t('nav.expand')}
            title={t('nav.expand')}
            className="rounded-lg p-1.5 transition-colors hover:bg-nav-raised"
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
            onClick={onClose}
          />
        )}
      </div>

      <div className={`flex w-full flex-col gap-0.5 ${compact ? 'px-2' : 'px-2'}`}>
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
        <div className="mt-5 flex w-full flex-col items-center gap-1.5 border-t border-nav-border pt-4">
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
                className={`flex size-9 items-center justify-center rounded-lg text-xs font-semibold transition-colors max-md:size-11 ${
                  active
                    ? 'bg-petrol-50 text-petrol-700 ring-1 ring-petrol-200'
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
            className="flex size-9 items-center justify-center rounded-lg border border-dashed border-nav-border text-nav-muted transition-colors hover:bg-nav-raised hover:text-nav-text max-md:size-11"
          >
            <Icon name="plus" className="size-4" />
          </button>
        </div>
      ) : (
        <div className="mt-5 flex min-h-0 w-full flex-1 flex-col px-2">
          <div className="mb-1 flex items-center justify-between gap-2 pr-0.5 pl-2">
            <h2 className="text-[11px] font-medium text-nav-muted">
              {t('nav.myBoards')}
            </h2>
            <IconButton
              icon="plus"
              label={t('board.new')}
              onClick={onNewBoard}
              className="size-7"
            />
          </div>
          <ul className="flex flex-col gap-0.5 overflow-y-auto scrollbar-slim">
            {boards.map((board) => {
              const active = board.public_id === activeBoardId;
              return (
                <li key={board.public_id}>
                  <button
                    type="button"
                    onClick={() => onSelectBoard(board.public_id)}
                    aria-current={active ? 'true' : undefined}
                    className={`flex min-h-9 w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-[13px] transition-colors max-md:min-h-11 ${
                      active
                        ? 'bg-petrol-50 font-medium text-petrol-700'
                        : 'text-nav-muted hover:bg-nav-raised hover:text-nav-text'
                    }`}
                  >
                    <span
                      className={`flex size-5 shrink-0 items-center justify-center rounded-[5px] text-[11px] font-semibold ${
                        active
                          ? 'bg-petrol-600 text-onaccent'
                          : 'bg-black/5 text-nav-muted dark:bg-white/10'
                      }`}
                      aria-hidden="true"
                    >
                      {board.title.charAt(0).toUpperCase()}
                    </span>
                    <span className="truncate">{board.title}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          {boards.length === 0 && (
            <p className="px-2 py-2 text-[11px] leading-relaxed text-nav-muted">
              {t('board.emptyTitle')}
            </p>
          )}
        </div>
      )}

      <div
        className={`mt-auto flex w-full shrink-0 flex-col gap-0.5 border-t border-nav-border py-2.5 ${
          compact ? 'items-center px-2' : 'px-2'
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
          align="start"
          tone="inverse"
          triggerClassName={
            compact
              ? 'rounded-lg p-1'
              : 'mt-1 w-full rounded-lg px-2 py-1.5 text-left hover:bg-nav-raised'
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
                <span className="block truncate text-[11px] text-nav-muted">
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
