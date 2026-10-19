import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button, Input, Select, TextArea } from '@/components/ui';
import { CrudFormLayout, FormFooter } from '@/features/crud';
import type { Color } from '@/features/products/types';
import { colorSchema, type ColorFormValues } from '@/validation';

interface ColorFormProps {
  color?: Color | null;
  isSubmitting?: boolean;
  onCancel: () => void;
  onSubmit: (values: ColorFormValues) => Promise<void>;
}

export function ColorForm({
  color,
  isSubmitting = false,
  onCancel,
  onSubmit,
}: ColorFormProps) {
  const [validationSummary, setValidationSummary] = useState('');
  const { register, handleSubmit, reset } = useForm<ColorFormValues>({
    defaultValues: {
      color_name: '',
      hex_color: '#FF69B4',
      availability: 'available',
      description: '',
    },
  });

  useEffect(() => {
    reset({
      color_name: color?.color_name ?? '',
      hex_color: color?.hex_color ?? '#FF69B4',
      availability: color?.availability ?? 'available',
      description: color?.description ?? '',
    });
  }, [color, reset]);

  const submitForm = handleSubmit(async (values) => {
    const parsed = colorSchema.safeParse(values);

    if (!parsed.success) {
      setValidationSummary(parsed.error.issues[0]?.message ?? 'Please review the form.');
      return;
    }

    setValidationSummary('');
    await onSubmit(parsed.data);
  });

  return (
    <CrudFormLayout
      title={color ? 'Edit Color' : 'Create Color'}
      description="Manage bouquet color options."
      validationSummary={validationSummary}
      footer={
        <FormFooter
          saveLabel={color ? 'Save Changes' : 'Create Color'}
          isLoading={isSubmitting}
          onCancel={onCancel}
          onSave={submitForm}
        />
      }
    >
      <Input label="Color Name" required {...register('color_name')} />
      <Input
        label="Hex Color"
        required
        placeholder="#FF69B4"
        {...register('hex_color')}
      />
      <Select
        label="Status"
        options={[
          { label: 'Active', value: 'available' },
          { label: 'Inactive', value: 'unavailable' },
        ]}
        {...register('availability')}
      />
      <div className="md:col-span-2">
        <TextArea label="Description" rows={4} {...register('description')} />
      </div>
      <Button type="submit" className="hidden" onClick={submitForm}>
        Submit
      </Button>
    </CrudFormLayout>
  );
}
