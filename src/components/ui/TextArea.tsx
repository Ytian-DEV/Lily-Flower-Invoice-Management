import { forwardRef, useId, type ReactNode, type TextareaHTMLAttributes } from 'react';

import { Field } from '@/components/ui/Field';
import { controlClasses, fieldDescriptionId } from '@/components/ui/styles';
import { cn } from '@/utils/cn';

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: ReactNode;
  containerClassName?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    { className, containerClassName, error, helperText, id, label, required, ...props },
    ref,
  ) => {
    const generatedId = useId();
    const textAreaId = id ?? generatedId;

    return (
      <Field
        id={textAreaId}
        label={label}
        required={required}
        error={error}
        helperText={helperText}
        className={containerClassName}
      >
        <textarea
          ref={ref}
          id={textAreaId}
          required={required}
          rows={3}
          aria-invalid={error ? true : undefined}
          aria-describedby={
            error || helperText ? fieldDescriptionId(textAreaId) : undefined
          }
          className={cn(controlClasses, 'min-h-20 resize-y px-3 py-2', className)}
          {...props}
        />
      </Field>
    );
  },
);

TextArea.displayName = 'TextArea';
