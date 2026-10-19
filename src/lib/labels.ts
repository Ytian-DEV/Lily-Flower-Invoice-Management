import type { InvoicePaymentState, InvoiceStatus, PaymentMethod } from '@/types/database';

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  cash: 'Cash',
  gcash: 'GCash',
  bank_transfer: 'Bank transfer',
  maribank: 'MariBank',
};

export const paymentMethodOptions = (
  Object.keys(paymentMethodLabels) as PaymentMethod[]
).map((value) => ({ value, label: paymentMethodLabels[value] }));

export const orderStatusLabels: Record<InvoiceStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready',
  out_for_delivery: 'Out for delivery',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const paymentStateLabels: Record<InvoicePaymentState, string> = {
  unpaid: 'Unpaid',
  partially_paid: 'Partly paid',
  paid: 'Paid',
};
