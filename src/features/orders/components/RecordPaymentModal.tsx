import { useEffect, useState, type FormEvent } from 'react';

import { Button, Input, Modal, Select, useToast } from '@/components/ui';
import { useRecordPayment } from '@/features/orders/api';
import { roundCurrency } from '@/features/orders/utils/pricing';
import { paymentMethodOptions } from '@/lib/labels';
import { uploadReceipt } from '@/services/storage';
import type { PaymentMethod } from '@/types/database';
import { formatCurrency } from '@/utils/formatCurrency';
import { manilaToday } from '@/utils/formatDate';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceId: string;
  invoiceNumber: string;
  balanceDue: number;
}

export function RecordPaymentModal({
  balanceDue,
  invoiceId,
  invoiceNumber,
  isOpen,
  onClose,
}: RecordPaymentModalProps) {
  const { showToast } = useToast();
  const recordPayment = useRecordPayment();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [paymentDate, setPaymentDate] = useState(manilaToday());
  const [reference, setReference] = useState('');
  const [receipt, setReceipt] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAmount(balanceDue > 0 ? balanceDue.toFixed(2) : '');
      setMethod('cash');
      setPaymentDate(manilaToday());
      setReference('');
      setReceipt(null);
      setError('');
    }
  }, [balanceDue, isOpen]);

  const isDigital = method !== 'cash';

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const value = roundCurrency(Number(amount));

    if (!Number.isFinite(value) || value <= 0) {
      setError('Enter an amount greater than zero.');
      return;
    }

    if (value > balanceDue) {
      setError(`That is more than the balance due (${formatCurrency(balanceDue)}).`);
      return;
    }

    setError('');
    let receiptPath: string | null = null;

    if (isDigital && receipt) {
      setIsUploading(true);
      const upload = await uploadReceipt(receipt, invoiceId);
      setIsUploading(false);

      if (upload.error) {
        setError(`Receipt upload failed: ${upload.error.message}`);
        return;
      }

      receiptPath = upload.data.path;
    }

    try {
      await recordPayment.mutateAsync({
        invoice_id: invoiceId,
        amount: value,
        payment_method: method,
        payment_date: paymentDate,
        reference_number: isDigital ? reference.trim() || null : null,
        receipt_path: receiptPath,
      });
      showToast({
        variant: 'success',
        title: `${formatCurrency(value)} recorded`,
        description: invoiceNumber,
      });
      onClose();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Payment was not saved.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record payment"
      description={`${invoiceNumber} · Balance due ${formatCurrency(balanceDue)}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="record-payment-form"
            isLoading={isUploading || recordPayment.isPending}
          >
            Record payment
          </Button>
        </>
      }
    >
      <form id="record-payment-form" className="grid gap-4" onSubmit={submit} noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Amount"
            type="number"
            inputMode="decimal"
            min="0.01"
            step="0.01"
            required
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            error={error || undefined}
          />
          <Select
            label="Method"
            value={method}
            onChange={(event) => setMethod(event.target.value as PaymentMethod)}
            options={paymentMethodOptions}
          />
          <Input
            label="Date received"
            type="date"
            required
            max={manilaToday()}
            value={paymentDate}
            onChange={(event) => setPaymentDate(event.target.value)}
          />
          {isDigital ? (
            <Input
              label="Reference no."
              value={reference}
              onChange={(event) => setReference(event.target.value)}
              placeholder="From the transfer receipt"
            />
          ) : null}
        </div>
        {isDigital ? (
          <Input
            label="Receipt screenshot"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(event) => setReceipt(event.target.files?.[0] ?? null)}
            helperText="Optional, but makes it easy to check later."
          />
        ) : null}
      </form>
    </Modal>
  );
}
