import Icon, { type IconName } from '../atoms/Icon';

interface NavItemProps {
  icon: IconName;
  label: string;
  active?: boolean;
  count?: number | undefined;
  collapsed?: boolean;
  onClick?: () => void;
}

export default function NavItem({
  icon,
  label,
  active = false,
  count,
  collapsed = false,
  onClick,
}: NavItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      title={collapsed ? label : undefined}
      className={`flex h-9 w-full items-center gap-3 rounded-lg px-2.5 text-[13px] transition-colors duration-150 max-md:min-h-11 ${
        active
          ? 'bg-petrol-50 font-medium text-petrol-700'
          : 'text-nav-muted hover:bg-nav-raised hover:text-nav-text'
      } ${collapsed ? 'justify-center px-0' : ''}`}
    >
      <Icon name={icon} className="size-4 shrink-0" />
      {!collapsed && (
        <>
          <span className="flex-1 truncate text-left">{label}</span>
          {count !== undefined && count > 0 && (
            <span className="rounded-full bg-black/5 px-1.5 py-0.5 text-[11px] font-medium tabular-nums dark:bg-white/10">
              {count}
            </span>
          )}
        </>
      )}
    </button>
  );
}
