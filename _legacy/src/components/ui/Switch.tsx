import { forwardRef, type InputHTMLAttributes } from 'react';

import { cn } from '@/utils/cn';

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  helperText?: string;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, helperText, id, label, ...props }, ref) => {
    const switchId = id ?? props.name;

    return (
      <label className="flex cursor-pointer items-start gap-3" htmlFor={switchId}>
        <span className="relative mt-0.5 inline-flex">
          <input
            ref={ref}
            id={switchId}
            type="checkbox"
            role="switch"
            className={cn(
              'peer sr-only focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
              className,
            )}
            {...props}
          />
          <span className="h-7 w-12 rounded-full border border-border bg-muted/30 transition peer-checked:border-primary peer-checked:bg-primary peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary peer-disabled:opacity-60" />
          <span className="absolute left-1 top-1 size-5 rounded-full bg-surface shadow-sm transition peer-checked:translate-x-5" />
        </span>
        {label || helperText ? (
          <span className="grid gap-1 text-sm">
            {label ? <span className="font-medium text-text">{label}</span> : null}
            {helperText ? <span className="text-muted">{helperText}</span> : null}
          </span>
        ) : null}
      </label>
    );
  },
);

Switch.displayName = 'Switch';
