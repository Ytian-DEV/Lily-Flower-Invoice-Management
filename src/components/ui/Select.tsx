import { forwardRef, useId, type ReactNode, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';

import { Field } from '@/components/ui/Field';
import { controlClasses, fieldDescriptionId } from '@/components/ui/styles';
import { cn } from '@/utils/cn';

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: ReactNode;
  options: SelectOption[];
  containerClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      containerClassName,
      error,
      helperText,
      id,
      label,
      options,
      required,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const selectId = id ?? generatedId;

    return (
      <Field
        id={selectId}
        label={label}
        required={required}
        error={error}
        helperText={helperText}
        className={containerClassName}
      >
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            required={required}
            aria-invalid={error ? true : undefined}
            aria-describedby={
              error || helperText ? fieldDescriptionId(selectId) : undefined
            }
            className={cn(controlClasses, 'h-10 appearance-none pr-9 pl-3', className)}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-subtle"
          />
        </div>
      </Field>
    );
  },
);

Select.displayName = 'Select';
