export type IconName =
  | 'board'
  | 'calendar'
  | 'search'
  | 'plus'
  | 'close'
  | 'chevron-left'
  | 'chevron-right'
  | 'chevron-down'
  | 'archive'
  | 'settings'
  | 'paperclip'
  | 'tag'
  | 'grip'
  | 'inbox'
  | 'alert'
  | 'sun'
  | 'moon'
  | 'monitor'
  | 'globe'
  | 'pencil'
  | 'trash'
  | 'check'
  | 'users'
  | 'more'
  | 'upload'
  | 'message';

interface IconProps {
  name: IconName;
  className?: string;
}
const PATHS: Record<IconName, string> = {
  board: 'M4 5h5v14H4zM11 5h4v9h-4zM17 5h3v6h-3',
  calendar: 'M4 8h16M7 4v3M17 4v3M5 8h14v12H5zM9 13h2M14 13h1',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14M16.5 16.5 21 21',
  plus: 'M12 5v14M5 12h14',
  close: 'M6 6l12 12M18 6 6 18',
  'chevron-left': 'M14 6l-6 6 6 6',
  'chevron-right': 'M10 6l6 6-6 6',
  'chevron-down': 'M6 10l6 6 6-6',
  archive: 'M4 7h16v4H4zM6 11v9h12v-9M10 15h4',
  settings:
    'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6M12 3v2M12 19v2M5 12H3M21 12h-2M6 6 4.5 4.5M19.5 19.5 18 18M18 6l1.5-1.5M4.5 19.5 6 18',
  paperclip: 'M9 12v5a3 3 0 0 0 6 0V8a4 4 0 0 0-8 0v9a6 6 0 0 0 12 0V9',
  tag: 'M4 11V5h6l9 9-6 6zM7.5 8h.01',
  grip: 'M9 6h.01M9 12h.01M9 18h.01M15 6h.01M15 12h.01M15 18h.01',
  inbox: 'M4 13h4l1 3h6l1-3h4M4 13l2-8h12l2 8v6H4z',
  alert: 'M12 4l9 16H3zM12 10v4M12 17h.01',
  sun: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8M12 2v2M12 20v2M4 12H2M22 12h-2M5.6 5.6 4.2 4.2M19.8 19.8l-1.4-1.4M18.4 5.6l1.4-1.4M4.2 19.8l1.4-1.4',
  moon: 'M20 14.5A8.5 8.5 0 0 1 9.5 4a7 7 0 1 0 10.5 10.5',
  monitor: 'M4 5h16v10H4zM9 19h6M12 15v4',
  globe:
    'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18M3.5 9h17M3.5 15h17M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18',
  pencil: 'M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16zM14 6l4 4',
  trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6',
  check: 'M5 13l4 4L19 7',
  users:
    'M8 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M2 20v-1a6 6 0 0 1 12 0v1M16 4.5a3.5 3.5 0 0 1 0 7M18 20v-1a6 6 0 0 0-3-5.2',
  more: 'M6 12h.01M12 12h.01M18 12h.01',
  upload: 'M12 16V4M8 8l4-4 4 4M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3',
  message: 'M20 15a2 2 0 0 1-2 2H8l-4 4V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z',
};

export default function Icon({ name, className = 'size-4' }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
