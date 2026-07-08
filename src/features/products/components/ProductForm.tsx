import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button, Input, Select, TextArea } from '@/components/ui';
import { CrudFormLayout, FormFooter } from '@/features/crud';
import type { Product, ProductCategory } from '@/features/products/types';
import { productSchema, type ProductFormValues } from '@/validation';

interface ProductFormProps {
  categories: ProductCategory[];
  product?: Product | null;
  isSubmitting?: boolean;
  onCancel: () => void;
  onSubmit: (values: ProductFormValues) => Promise<void>;
}

export function ProductForm({
  categories,
  isSubmitting = false,
  onCancel,
  onSubmit,
  product,
}: ProductFormProps) {
  const [validationSummary, setValidationSummary] = useState('');
  const { register, handleSubmit, reset, watch } = useForm<ProductFormValues>({
    defaultValues: {
      product_name: '',
      category_id: null,
      stem_count: null,
      base_price: 0,
      availability: 'available',
      description: '',
    },
  });

  useEffect(() => {
    reset({
      product_name: product?.product_name ?? '',
      category_id: product?.category_id ?? null,
      stem_count: product?.stem_count ?? null,
      base_price: product?.base_price ?? 0,
      availability: product?.availability ?? 'available',
      description: product?.description ?? '',
    });
  }, [product, reset]);

  const categoryOptions = useMemo(
    () => [
      { label: 'Uncategorized', value: '' },
      ...categories.map((category) => ({ label: category.name, value: category.id })),
    ],
    [categories],
  );

  const submitForm = handleSubmit(async (values) => {
    const parsed = productSchema.safeParse({
      ...values,
      category_id: values.category_id || null,
      stem_count: values.stem_count ? Number(values.stem_count) : null,
      base_price: Number(values.base_price),
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
      title={product ? 'Edit Product' : 'Create Product'}
      description="Manage bouquet catalog details."
      validationSummary={validationSummary}
      footer={
        <FormFooter
          saveLabel={product ? 'Save Changes' : 'Create Product'}
          isLoading={isSubmitting}
          onCancel={onCancel}
          onSave={submitForm}
        />
      }
    >
      <Input label="Product Name" required {...register('product_name')} />
      <Select
        label="Category"
        options={categoryOptions}
        value={watch('category_id') ?? ''}
        {...register('category_id')}
      />
      <Input
        label="Stem Count"
        type="number"
        min={1}
        {...register('stem_count', { valueAsNumber: true })}
      />
      <Input
        label="Base Price"
        required
        type="number"
        min={0}
        step="0.01"
        {...register('base_price', { valueAsNumber: true })}
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
