import { type InputHTMLAttributes, type ReactNode, useId } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | null;
  icon?: ReactNode;
  hint?: string;
}

export function Input({ label, error, icon, hint, className = '', id, ...props }: InputProps) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block mb-2 text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
          {label}
          {props.required && <span aria-hidden="true" className="text-danger ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span
            className="absolute left-4 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--color-text-secondary)' }}
            aria-hidden="true"
          >
            {icon}
          </span>
        )}
        <input
          id={inputId}
          className={`input-field ${icon ? 'pl-11' : ''} ${error ? '!border-danger' : ''} ${className}`}
          aria-invalid={error ? true : undefined}
          aria-describedby={[error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined}
          {...props}
        />
      </div>
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-sm" style={{ color: 'var(--color-danger)' }}>
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={hintId} className="mt-1.5 text-xs" style={{ color: 'var(--color-text-hint)' }}>
          {hint}
        </p>
      )}
    </div>
  );
}
