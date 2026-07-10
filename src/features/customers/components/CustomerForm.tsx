import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button, Input, TextArea } from '@/components/ui';
import { CrudFormLayout, FormFooter } from '@/features/crud';
import type { Customer } from '@/features/customers/types';
import {
  createCustomerCode,
  normalizePhoneNumber,
} from '@/features/customers/utils/customerFormatters';
import { customerSchema, type CustomerFormValues } from '@/validation';

interface CustomerFormProps {
  customer?: Customer | null;
  isSubmitting?: boolean;
  onCancel: () => void;
  onSubmit: (values: CustomerFormValues) => Promise<void>;
}

export function CustomerForm({
  customer,
  isSubmitting = false,
  onCancel,
  onSubmit,
}: CustomerFormProps) {
  const [validationSummary, setValidationSummary] = useState('');
  const { register, handleSubmit, reset } = useForm<CustomerFormValues>({
    defaultValues: {
      customer_code: createCustomerCode(),
      full_name: '',
      phone_number: '',
      delivery_address: '',
      notes: '',
    },
  });

  useEffect(() => {
    reset({
      customer_code: customer?.customer_code ?? createCustomerCode(),
      full_name: customer?.full_name ?? '',
      phone_number: customer?.phone_number ?? '',
      delivery_address: customer?.delivery_address ?? '',
      notes: customer?.notes ?? '',
    });
  }, [customer, reset]);

  const submitForm = handleSubmit(async (values) => {
    const parsed = customerSchema.safeParse({
      ...values,
      phone_number: normalizePhoneNumber(values.phone_number),
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
      title={customer ? 'Edit Customer' : 'Create Customer'}
      description="Save customer contact, delivery, and seller notes."
      validationSummary={validationSummary}
      footer={
        <FormFooter
          saveLabel={customer ? 'Save Changes' : 'Create Customer'}
          isLoading={isSubmitting}
          onCancel={onCancel}
          onSave={submitForm}
        />
      }
    >
      <Input label="Customer Name" required {...register('full_name')} />
      <Input
        label="Phone Number"
        required
        placeholder="09151234567 or +639151234567"
        {...register('phone_number')}
      />
      <div className="md:col-span-2">
        <TextArea
          label="Delivery Address"
          required
          rows={3}
          {...register('delivery_address')}
        />
      </div>
      <div className="md:col-span-2">
        <TextArea
          label="Customer Notes"
          rows={4}
          helperText="Preferences, delivery instructions, wrapper color, favorite bouquet, or payment notes."
          {...register('notes')}
        />
      </div>
      <input type="hidden" {...register('customer_code')} />
      <Button type="submit" className="hidden" onClick={submitForm}>
        Submit
      </Button>
    </CrudFormLayout>
  );
}
