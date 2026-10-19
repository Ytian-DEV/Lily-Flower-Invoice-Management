import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';

import { Field } from '@/components/ui/Field';
import { controlClasses, fieldDescriptionId } from '@/components/ui/styles';
import { cn } from '@/utils/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: ReactNode;
  leadingIcon?: ReactNode;
  trailingSlot?: ReactNode;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      containerClassName,
      error,
      helperText,
      id,
      label,
      leadingIcon,
      required,
      trailingSlot,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const hasDescription = Boolean(error || helperText);

    return (
      <Field
        id={inputId}
        label={label}
        required={required}
        error={error}
        helperText={helperText}
        className={containerClassName}
      >
        <div className="relative">
          {leadingIcon ? (
            <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-subtle [&_svg]:size-4">
              {leadingIcon}
            </span>
          ) : null}
          <input
            ref={ref}
            id={inputId}
            required={required}
            aria-invalid={error ? true : undefined}
            aria-describedby={hasDescription ? fieldDescriptionId(inputId) : undefined}
            className={cn(
              controlClasses,
              'h-10 px-3 tabular-nums',
              props.type === 'file' &&
                'h-auto py-2 file:mr-3 file:rounded-md file:border-0 file:bg-primary-soft file:px-3 file:py-1 file:text-sm file:font-medium file:text-primary-dark',
              leadingIcon && 'pl-9',
              trailingSlot && 'pr-10',
              className,
            )}
            {...props}
          />
          {trailingSlot ? (
            <span className="absolute top-1/2 right-1 -translate-y-1/2">
              {trailingSlot}
            </span>
          ) : null}
        </div>
      </Field>
    );
  },
);

Input.displayName = 'Input';
