import { useEffect, useRef, useState } from 'react';
import Icon, { type IconName } from '../atoms/Icon';
import IconButton from '../atoms/IconButton';

export interface MenuAction {
  id: string;
  label: string;
  icon: IconName;
  onSelect: () => void;
  tone?: 'default' | 'danger';
  disabled?: boolean;
}

interface MenuPopoverProps {
  label: string;
  actions: MenuAction[];
  align?: 'left' | 'right';
}

export default function MenuPopover({
  label,
  actions,
  align = 'right',
}: MenuPopoverProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <IconButton
        icon="more"
        label={label}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
        className="size-7"
      />

      {open && (
        <div
          role="menu"
          aria-label={label}
          className={`absolute top-full z-40 mt-1 w-44 overflow-hidden rounded-xl bg-paper-50 p-1 shadow-lg ring-1 ring-paper-300 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {actions.map((action) => (
            <button
              key={action.id}
              type="button"
              role="menuitem"
              disabled={action.disabled ?? false}
              onClick={() => {
                setOpen(false);
                action.onSelect();
              }}
              className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-medium transition-colors disabled:pointer-events-none disabled:opacity-40 ${
                action.tone === 'danger'
                  ? 'text-berry-500 hover:bg-berry-100'
                  : 'text-ink-600 hover:bg-paper-100 hover:text-ink-900'
              }`}
            >
              <Icon name={action.icon} className="size-3.5 shrink-0" />
              <span className="truncate">{action.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
