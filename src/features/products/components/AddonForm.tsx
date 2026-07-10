import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button, Input, Select, TextArea } from '@/components/ui';
import { CrudFormLayout, FormFooter } from '@/features/crud';
import type { Addon } from '@/features/products/types';
import { addonSchema, type AddonFormValues } from '@/validation';

interface AddonFormProps {
  addon?: Addon | null;
  isSubmitting?: boolean;
  onCancel: () => void;
  onSubmit: (values: AddonFormValues) => Promise<void>;
}

export function AddonForm({
  addon,
  isSubmitting = false,
  onCancel,
  onSubmit,
}: AddonFormProps) {
  const [validationSummary, setValidationSummary] = useState('');
  const { register, handleSubmit, reset } = useForm<AddonFormValues>({
    defaultValues: {
      addon_name: '',
      price: 0,
      availability: 'available',
      description: '',
    },
  });

  useEffect(() => {
    reset({
      addon_name: addon?.addon_name ?? '',
      price: addon?.price ?? 0,
      availability: addon?.availability ?? 'available',
      description: addon?.description ?? '',
    });
  }, [addon, reset]);

  const submitForm = handleSubmit(async (values) => {
    const parsed = addonSchema.safeParse({
      ...values,
      price: Number(values.price),
    });

    if (!parsed.success) {
      setValidationSummary(parsed.error.issues[0]?.message ?? 'Please review the form.');
      return;
    }

    setValidationSummary('');
    await onSubmit(parsed.data);
  });

  return (
    <CrudFormLayout
      title={addon ? 'Edit Add-on' : 'Create Add-on'}
      description="Manage optional catalog add-ons independently from bouquets."
      validationSummary={validationSummary}
      footer={
        <FormFooter
          saveLabel={addon ? 'Save Changes' : 'Create Add-on'}
          isLoading={isSubmitting}
          onCancel={onCancel}
          onSave={submitForm}
        />
      }
    >
      <Input label="Add-on Name" required {...register('addon_name')} />
      <Input
        label="Price"
        required
        type="number"
        min={0}
        step="0.01"
        {...register('price', { valueAsNumber: true })}
      />
      <Select
        label="Availability"
        options={[
          { label: 'Available', value: 'available' },
          { label: 'Unavailable', value: 'unavailable' },
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
