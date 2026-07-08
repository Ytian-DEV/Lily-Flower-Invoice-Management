import type { InputHTMLAttributes } from 'react';

import { cn } from '@/utils/cn';

export interface RadioOption {
  label: string;
  value: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'value' | 'onChange'
> {
  name: string;
  options: RadioOption[];
  value?: string;
  label?: string;
  error?: string;
  helperText?: string;
  onValueChange?: (value: string) => void;
}

export function RadioGroup({
  className,
  error,
  helperText,
  label,
  name,
  onValueChange,
  options,
  value,
  ...props
}: RadioGroupProps) {
  return (
    <fieldset className={cn('grid gap-3', className)}>
      {label ? (
        <legend className="text-sm font-semibold text-text">{label}</legend>
      ) : null}
      <div className="grid gap-2">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-surface p-3 text-sm transition hover:bg-accent/50 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60"
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              disabled={option.disabled}
              onChange={() => onValueChange?.(option.value)}
              className="mt-0.5 size-5 accent-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              aria-invalid={error ? true : undefined}
              {...props}
            />
            <span>
              <span className="block font-medium text-text">{option.label}</span>
              {option.description ? (
                <span className="mt-1 block text-muted">{option.description}</span>
              ) : null}
            </span>
          </label>
        ))}
      </div>
      {error || helperText ? (
        <p className={cn('text-sm text-muted', error && 'text-primary-dark')}>
          {error ?? helperText}
        </p>
      ) : null}
    </fieldset>
  );
}
