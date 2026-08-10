import Button from '../atoms/Button';
import Icon from '../atoms/Icon';
import IconButton from '../atoms/IconButton';
import AccountMenu from './AccountMenu';
import BoardSwitcher from '../molecules/BoardSwitcher';
import SearchField from '../molecules/SearchField';
import ThemeToggle from '../molecules/ThemeToggle';
import LocaleSwitcher from '../molecules/LocaleSwitcher';
import { useT } from '../../i18n/LocaleContext';
import type { ThemePreference } from '../../lib/theme';
import type { Board, User } from '../../types/domain';

interface TopbarProps {
  boards: Board[];
  activeBoardId: string;
  user: User;
  query: string;
  cardCount: number;
  theme: ThemePreference;
  onSelectBoard: (publicId: string) => void;
  onQueryChange: (value: string) => void;
  onOpenMenu: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;
  onThemeChange: (preference: ThemePreference) => void;
  onNewBoard: () => void;
  onEditBoard: (() => void) | null;
  onManageLabels: () => void;
}

export default function Topbar({
  boards,
  activeBoardId,
  user,
  query,
  cardCount,
  theme,
  onSelectBoard,
  onQueryChange,
  onOpenMenu,
  onOpenSettings,
  onLogout,
  onThemeChange,
  onNewBoard,
  onEditBoard,
  onManageLabels,
}: TopbarProps) {
  const t = useT();

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-paper-300/60 bg-paper-50 px-3 sm:gap-3 sm:px-5">
      <IconButton
        icon="grip"
        label={t('nav.openMenu')}
        onClick={onOpenMenu}
        className="md:hidden"
      />

      <BoardSwitcher
        boards={boards}
        activeId={activeBoardId}
        onSelect={onSelectBoard}
      />

      {onEditBoard !== null && (
        <IconButton
          icon="pencil"
          label={t('board.edit')}
          onClick={onEditBoard}
          className="hidden sm:inline-flex"
        />
      )}

      <span className="hidden items-center rounded-md bg-paper-100 px-2 py-1 font-mono text-[11px] text-ink-400 tabular-nums xl:inline-flex">
        {t('board.cardCount', { count: cardCount })}
      </span>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <div className="hidden sm:block">
          <SearchField value={query} onChange={onQueryChange} />
        </div>
        <span className="hidden lg:block">
          <ThemeToggle preference={theme} onChange={onThemeChange} />
        </span>

        <LocaleSwitcher />

        <IconButton
          icon="tag"
          label={t('label.manage')}
          onClick={onManageLabels}
        />

        <Button size="sm" onClick={onNewBoard} className="hidden xl:inline-flex">
          <Icon name="plus" className="size-3.5" />
          {t('board.new')}
        </Button>

        <IconButton
          icon="plus"
          label={t('board.new')}
          onClick={onNewBoard}
          className="xl:hidden"
        />
        <span className="hidden md:block">
          <AccountMenu
            user={user}
            theme={theme}
            placement="down"
            align="end"
            onThemeChange={onThemeChange}
            onOpenSettings={onOpenSettings}
            onLogout={onLogout}
          />
        </span>
      </div>
    </header>
  );
}
