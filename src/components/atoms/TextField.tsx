import type { InputHTMLAttributes } from 'react';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hideLabel?: boolean;
  readonly?: boolean;
}

export default function TextField({
  label,
  readonly,
  hideLabel = false,
  className = '',
  id,
  ...rest
}: TextFieldProps) {
  const fieldId = id ?? `field-${label.toLowerCase().replace(/\s+/g, '-')}`;

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
      <input
        id={fieldId}
        readOnly={readonly}
        className={`w-full rounded-lg px-3 py-2 text-sm ring-1 ring-inset transition placeholder:text-ink-400 ${
          readonly
            ? 'cursor-not-allowed bg-paper-100 text-ink-400 ring-paper-300 select-text'
            : 'bg-paper-50 text-ink-900 ring-paper-300 hover:ring-paper-400 focus:bg-paper-50 focus:ring-petrol-400 dark:ring-paper-400'
        } ${className}`}
        {...rest}
      />
    </div>
  );
}
