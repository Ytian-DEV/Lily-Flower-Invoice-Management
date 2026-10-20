import { forwardRef, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';

import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  placeholder?: string;
  options: SelectOption[];
  isLoading?: boolean;
  isSearchReady?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      disabled,
      error,
      helperText,
      id,
      isLoading = false,
      isSearchReady = false,
      label,
      options,
      placeholder,
      required,
      ...props
    },
    ref,
  ) => {
    const selectId = id ?? props.name;
    const descriptionId = selectId ? `${selectId}-description` : undefined;

    return (
      <div className="grid gap-2">
        {label ? (
          <label htmlFor={selectId} className="text-sm font-semibold text-text">
            {label}
            {required ? <span className="text-primary"> *</span> : null}
          </label>
        ) : null}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            required={required}
            disabled={disabled || isLoading}
            aria-invalid={error ? true : undefined}
            aria-describedby={descriptionId}
            data-search-ready={isSearchReady || undefined}
            className={cn(
              'min-h-12 w-full appearance-none rounded-xl border border-border bg-surface px-4 pr-11 text-sm text-text transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-accent/40 disabled:text-muted',
              error &&
                'border-primary-dark focus:border-primary-dark focus:ring-primary-dark/20',
              className,
            )}
            {...props}
          >
            {placeholder ? <option value="">{placeholder}</option> : null}
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted">
            {isLoading ? (
              <Spinner size="sm" />
            ) : (
              <ChevronDown aria-hidden="true" className="size-5" />
            )}
          </span>
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

Select.displayName = 'Select';
