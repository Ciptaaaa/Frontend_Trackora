interface LogoProps {
  markOnly?: boolean;
  tone?: 'default' | 'inverse';
}
export default function Logo({ markOnly = false, tone = 'default' }: LogoProps) {
  const inverse = tone === 'inverse';

  return (
    <span className="flex items-center gap-2.5">
      <span
        className={`flex size-8 shrink-0 items-end gap-0.5 rounded-lg p-2 ${
          inverse ? 'bg-nav-accent' : 'bg-petrol-600'
        }`}
        aria-hidden="true"
      >
        <span className="h-full w-0.5 rounded-full bg-saffron-400" />
        <span
          className={`h-2/3 w-1 rounded-full ${
            inverse ? 'bg-nav-text' : 'bg-paper-100'
          }`}
        />
        <span
          className={`h-1/3 w-1 rounded-full ${
            inverse ? 'bg-nav-muted' : 'bg-petrol-200'
          }`}
        />
      </span>
      {markOnly ? (
        <span className="sr-only">Trackora</span>
      ) : (
        <span
          className={`font-display text-[17px] leading-none font-semibold tracking-tight ${
            inverse ? 'text-nav-text' : 'text-ink-900'
          }`}
        >
          Trackora
        </span>
      )}
    </span>
  );
}
