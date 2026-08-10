import type { TextareaHTMLAttributes } from 'react';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hideLabel?: boolean;
}

export default function TextArea({
  label,
  hideLabel = false,
  className = '',
  id,
  rows = 3,
  ...rest
}: TextAreaProps) {
  const fieldId = id ?? `area-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="w-full">
      <label
        htmlFor={fieldId}
        className={
          hideLabel ? 'sr-only' : 'mb-1.5 block text-xs font-medium text-ink-600'
        }
      >
        {label}
      </label>
      <textarea
        id={fieldId}
        rows={rows}
        className={`w-full resize-y rounded-lg bg-paper-100 px-3 py-2 text-sm leading-relaxed text-ink-900 ring-1 ring-paper-300 ring-inset transition placeholder:text-ink-400 hover:bg-paper-50 focus:bg-paper-50 ${className}`}
        {...rest}
      />
    </div>
  );
}
