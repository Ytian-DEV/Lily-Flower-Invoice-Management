import { forwardRef, type TextareaHTMLAttributes } from 'react';

import { cn } from '@/utils/cn';

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  showCharacterCount?: boolean;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      className,
      error,
      helperText,
      id,
      label,
      maxLength,
      required,
      showCharacterCount = false,
      value,
      ...props
    },
    ref,
  ) => {
    const textAreaId = id ?? props.name;
    const descriptionId = textAreaId ? `${textAreaId}-description` : undefined;
    const count = typeof value === 'string' ? value.length : 0;

    return (
      <div className="grid gap-2">
        {label ? (
          <label htmlFor={textAreaId} className="text-sm font-semibold text-text">
            {label}
            {required ? <span className="text-primary"> *</span> : null}
          </label>
        ) : null}
        <textarea
          ref={ref}
          id={textAreaId}
          required={required}
          maxLength={maxLength}
          value={value}
          aria-invalid={error ? true : undefined}
          aria-describedby={descriptionId}
          className={cn(
            'min-h-32 w-full resize-y rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text transition placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-accent/40 disabled:text-muted',
            error &&
              'border-primary-dark focus:border-primary-dark focus:ring-primary-dark/20',
            className,
          )}
          {...props}
        />
        <div className="flex items-start justify-between gap-3">
          {error || helperText ? (
            <p
              id={descriptionId}
              className={cn('text-sm text-muted', error && 'text-primary-dark')}
            >
              {error ?? helperText}
            </p>
          ) : (
            <span />
          )}
          {showCharacterCount && maxLength ? (
            <p className="text-sm text-muted">
              {count}/{maxLength}
            </p>
          ) : null}
        </div>
      </div>
    );
  },
);

TextArea.displayName = 'TextArea';
