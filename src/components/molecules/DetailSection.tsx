import type { ReactNode } from 'react';

interface DetailSectionProps {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}
export default function DetailSection({
  title,
  action,
  children,
}: DetailSectionProps) {
  return (
    <section>
      <div className="mb-2 flex min-h-6 items-center gap-2">
        <h3 className="flex-1 text-[11px] font-semibold tracking-wide text-ink-400 uppercase">
          {title}
        </h3>
        {action}
      </div>
      {children}
    </section>
  );
}
