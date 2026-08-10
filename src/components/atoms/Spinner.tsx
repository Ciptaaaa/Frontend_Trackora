type SpinnerSize = 'sm' | 'md';

interface SpinnerProps {
  label?: string;
  size?: SpinnerSize;
}
const HEIGHTS: Record<SpinnerSize, readonly number[]> = {
  sm: [7, 11, 15],
  md: [12, 18, 24],
};

export default function Spinner({ label, size = 'md' }: SpinnerProps) {
  const bars = HEIGHTS[size].map((height, index) => (
    <span
      key={height}
      className="w-1.5 animate-pulse rounded-full bg-petrol-400"
      style={{ height: `${height}px`, animationDelay: `${index * 120}ms` }}
    />
  ));

  if (label === undefined) {
    return (
      <span className="flex items-end gap-1" aria-hidden="true">
        {bars}
      </span>
    );
  }

  return (
    <span className="flex items-end gap-1" role="status" aria-label={label}>
      {bars}
    </span>
  );
}
