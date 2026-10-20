import type { ReactNode } from 'react';

import { fieldDescriptionId } from '@/components/ui/styles';
import { cn } from '@/utils/cn';

interface FieldProps {
  id?: string;
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: ReactNode;
  className?: string;
  children: ReactNode;
  trailing?: ReactNode;
}

/** Shared label / help text / error layout for every form control. */
export function Field({
  children,
  className,
  error,
  helperText,
  id,
  label,
  required,
  trailing,
}: FieldProps) {
  return (
    <div className={cn('grid gap-1.5', className)}>
      {label ? (
        <label htmlFor={id} className="text-sm font-medium text-text">
          {label}
          {required ? (
            <span className="ml-0.5 text-primary" aria-hidden="true">
              *
            </span>
          ) : null}
        </label>
      ) : null}
      {children}
      {error || helperText || trailing ? (
        <div className="flex items-start justify-between gap-3">
          {error || helperText ? (
            <p
              id={fieldDescriptionId(id)}
              className={cn('text-xs text-muted', error && 'text-danger-text')}
            >
              {error ?? helperText}
            </p>
          ) : (
            <span />
          )}
          {trailing}
        </div>
      ) : null}
    </div>
  );
}
