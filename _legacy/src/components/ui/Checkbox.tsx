import { forwardRef, type InputHTMLAttributes } from 'react';
import { Check } from 'lucide-react';

import { cn } from '@/utils/cn';

export interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type'
> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, error, helperText, id, label, ...props }, ref) => {
    const checkboxId = id ?? props.name;

    return (
      <div className="grid gap-1">
        <label
          className="flex cursor-pointer items-start gap-3 text-sm text-text"
          htmlFor={checkboxId}
        >
          <span className="relative mt-0.5">
            <input
              ref={ref}
              id={checkboxId}
              type="checkbox"
              className={cn(
                'peer size-5 appearance-none rounded-md border border-border bg-surface transition checked:border-primary checked:bg-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60',
                error && 'border-primary-dark',
                className,
              )}
              aria-invalid={error ? true : undefined}
              {...props}
            />
            <Check
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 m-auto size-4 text-white opacity-0 peer-checked:opacity-100"
            />
          </span>
          {label ? <span className="font-medium">{label}</span> : null}
        </label>
        {error || helperText ? (
          <p className={cn('pl-8 text-sm text-muted', error && 'text-primary-dark')}>
            {error ?? helperText}
          </p>
        ) : null}
      </div>
    );
  },
);

Checkbox.displayName = 'Checkbox';
