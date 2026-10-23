interface LogoProps {
  markOnly?: boolean;
  tone?: 'default' | 'inverse';
}
export default function Logo({ markOnly = false, tone = 'default' }: LogoProps) {
  const inverse = tone === 'inverse';

  return (
    <span className="flex items-center gap-2.5">
      <span
        className="flex size-8 shrink-0 items-end gap-0.5 rounded-lg bg-petrol-600 p-2 shadow-sm shadow-petrol-600/20"
        aria-hidden="true"
      >
        <span className="h-full w-0.5 rounded-full bg-mint-100" />
        <span className="h-2/3 w-1 rounded-full bg-onaccent" />
        <span className="h-1/3 w-1 rounded-full bg-petrol-200" />
      </span>
      {markOnly ? (
        <span className="sr-only">Trackora</span>
      ) : (
        <span
          className={`text-[17px] leading-none font-semibold tracking-[-0.02em] ${
            inverse ? 'text-nav-text' : 'text-ink-900'
          }`}
        >
          Trackora
        </span>
      )}
    </span>
  );
}
