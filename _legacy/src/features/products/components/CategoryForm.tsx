import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button, Input, Select, TextArea } from '@/components/ui';
import { CrudFormLayout, FormFooter } from '@/features/crud';
import type { ProductCategory } from '@/features/products/types';
import { productCategorySchema, type ProductCategoryFormValues } from '@/validation';

interface CategoryFormProps {
  category?: ProductCategory | null;
  isSubmitting?: boolean;
  onCancel: () => void;
  onSubmit: (values: ProductCategoryFormValues) => Promise<void>;
}

export function CategoryForm({
  category,
  isSubmitting = false,
  onCancel,
  onSubmit,
}: CategoryFormProps) {
  const [validationSummary, setValidationSummary] = useState('');
  const { register, handleSubmit, reset } = useForm<ProductCategoryFormValues>({
    defaultValues: {
      name: '',
      description: '',
      availability: 'available',
      sort_order: 0,
    },
  });

  useEffect(() => {
    reset({
      name: category?.name ?? '',
      description: category?.description ?? '',
      availability: category?.availability ?? 'available',
      sort_order: category?.sort_order ?? 0,
    });
  }, [category, reset]);

  const submitForm = handleSubmit(async (values) => {
    const parsed = productCategorySchema.safeParse({
      ...values,
      sort_order: Number(values.sort_order),
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
      title={category ? 'Edit Category' : 'Create Category'}
      description="Manage bouquet categories."
      validationSummary={validationSummary}
      footer={
        <FormFooter
          saveLabel={category ? 'Save Changes' : 'Create Category'}
          isLoading={isSubmitting}
          onCancel={onCancel}
          onSave={submitForm}
        />
      }
    >
      <Input label="Category Name" required {...register('name')} />
      <Input
        label="Sort Order"
        type="number"
        min={0}
        {...register('sort_order', { valueAsNumber: true })}
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
