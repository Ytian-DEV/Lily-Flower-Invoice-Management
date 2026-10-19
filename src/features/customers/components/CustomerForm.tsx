import { useState, type FormEvent } from 'react';

import { Button, Input, Modal, TextArea, useToast } from '@/components/ui';
import { useSaveCustomer, type CustomerSummary } from '@/features/customers/api';
import { createCustomerCode, normalizePhoneNumber } from '@/features/customers/utils';
import { customerSchema } from '@/validation';

interface CustomerFormModalProps {
  isOpen: boolean;
  customer: CustomerSummary | null;
  onClose: () => void;
}

type FieldErrors = Partial<
  Record<'full_name' | 'phone_number' | 'delivery_address', string>
>;

export function CustomerFormModal({ customer, isOpen, onClose }: CustomerFormModalProps) {
  const { showToast } = useToast();
  const saveCustomer = useSaveCustomer();
  const [errors, setErrors] = useState<FieldErrors>({});

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const parsed = customerSchema.safeParse({
      customer_code: customer?.customer_code ?? createCustomerCode(),
      full_name: String(form.get('full_name') ?? ''),
      phone_number: normalizePhoneNumber(String(form.get('phone_number') ?? '')),
      delivery_address: String(form.get('delivery_address') ?? ''),
      notes: String(form.get('notes') ?? '') || null,
    });

    if (!parsed.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof FieldErrors;
        fieldErrors[field] ??=
          field === 'phone_number'
            ? 'Use a mobile number like 0917 123 4567.'
            : 'This field is required.';
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});

    try {
      await saveCustomer.mutateAsync({ id: customer?.id, values: parsed.data });
      showToast({
        variant: 'success',
        title: customer ? 'Customer updated' : 'Customer added',
        description: parsed.data.full_name,
      });
      onClose();
    } catch (error) {
      showToast({
        variant: 'error',
        title: 'Customer was not saved',
        description: error instanceof Error ? error.message : undefined,
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={customer ? 'Edit customer' : 'Add customer'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="customer-form" isLoading={saveCustomer.isPending}>
            {customer ? 'Save changes' : 'Add customer'}
          </Button>
        </>
      }
    >
      <form
        id="customer-form"
        key={customer?.id ?? 'new'}
        className="grid gap-4"
        onSubmit={submit}
        noValidate
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            name="full_name"
            label="Name"
            required
            defaultValue={customer?.full_name}
            error={errors.full_name}
          />
          <Input
            name="phone_number"
            label="Mobile number"
            type="tel"
            required
            placeholder="0917 123 4567"
            defaultValue={customer?.phone_number}
            error={errors.phone_number}
          />
        </div>
        <TextArea
          name="delivery_address"
          label="Delivery address"
          required
          rows={2}
          defaultValue={customer?.delivery_address ?? ''}
          error={errors.delivery_address}
        />
        <TextArea
          name="notes"
          label="Notes"
          rows={3}
          placeholder="Favorite flowers, usual wrapper, birthdays to remember"
          defaultValue={customer?.notes ?? ''}
        />
      </form>
    </Modal>
  );
}
