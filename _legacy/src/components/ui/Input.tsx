import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

import { cn } from '@/utils/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      disabled,
      error,
      helperText,
      id,
      label,
      leadingIcon,
      required,
      trailingIcon,
      ...props
    },
    ref,
  ) => {
    const inputId = id ?? props.name;
    const descriptionId = inputId ? `${inputId}-description` : undefined;

    return (
      <div className="grid gap-2">
        {label ? (
          <label htmlFor={inputId} className="text-sm font-semibold text-text">
            {label}
            {required ? <span className="text-primary"> *</span> : null}
          </label>
        ) : null}
        <div className="relative">
          {leadingIcon ? (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
              {leadingIcon}
            </span>
          ) : null}
          <input
            ref={ref}
            id={inputId}
            required={required}
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            aria-describedby={descriptionId}
            className={cn(
              'min-h-12 w-full rounded-xl border border-border bg-surface px-4 text-sm text-text transition placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-accent/40 disabled:text-muted',
              leadingIcon && 'pl-11',
              trailingIcon && 'pr-11',
              error &&
                'border-primary-dark focus:border-primary-dark focus:ring-primary-dark/20',
              className,
            )}
            {...props}
          />
          {trailingIcon ? (
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted">
              {trailingIcon}
            </span>
          ) : null}
        </div>
        {error || helperText ? (
          <p
            id={descriptionId}
            className={cn('text-sm text-muted', error && 'text-primary-dark')}
          >
            {error ?? helperText}
          </p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = 'Input';
