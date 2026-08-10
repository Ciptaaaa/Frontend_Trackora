import { useState, type InputHTMLAttributes } from 'react';
import { useT } from '../../i18n/LocaleContext';

interface PasswordFieldProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type'
> {
  label: string;
  hint?: string | undefined;
}

export default function PasswordField({
  label,
  hint,
  id,
  className = '',
  ...rest
}: PasswordFieldProps) {
  const t = useT();
  const [visible, setVisible] = useState(false);
  const fieldId = id ?? 'password';
  const hintId = hint === undefined ? undefined : `${fieldId}-hint`;

  return (
    <div className="w-full">
      <label
        htmlFor={fieldId}
        className="mb-1.5 block text-xs font-medium text-ink-600"
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={fieldId}
          type={visible ? 'text' : 'password'}
          aria-describedby={hintId}
          className={`h-11 w-full rounded-lg bg-paper-100 pr-20 pl-3 text-sm text-ink-900 ring-1 ring-paper-300 ring-inset transition placeholder:text-ink-400 hover:bg-paper-50 focus:bg-paper-50 ${className}`}
          {...rest}
        />
        <button
          type="button"
          onClick={() => setVisible((value) => !value)}
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md px-2 py-1 text-[11px] font-medium text-ink-400 transition-colors hover:bg-paper-200 hover:text-ink-800"
        >
          {visible ? t('password.hide') : t('password.show')}
        </button>
      </div>

      {hint !== undefined && (
        <p id={hintId} className="mt-1.5 text-[11px] text-ink-400">
          {hint}
        </p>
      )}
    </div>
  );
}
