import type { Label } from '../../types/domain';

interface LabelChipProps {
  label: Label;
  compact?: boolean;
}

export default function LabelChip({ label, compact = false }: LabelChipProps) {
  if (compact) {
    return (
      <span
        className="block h-1 w-6 rounded-full"
        style={{ backgroundColor: label.color }}
        title={label.name}
      >
        <span className="sr-only">{label.name}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-paper-200 py-0.5 pr-2 pl-1.5 text-[11px] font-medium text-ink-600">
      <span
        className="size-2 rounded-full"
        style={{ backgroundColor: label.color }}
        aria-hidden="true"
      />
      {label.name}
    </span>
  );
}
