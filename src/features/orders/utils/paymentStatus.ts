import type { Order } from '@/features/orders/types';

type InvoiceAmounts = Pick<Order, 'total_amount' | 'remaining_balance'>;

export type InvoicePaymentStatus = 'paid' | 'partially-paid' | 'unpaid';

/** remaining_balance is maintained by the database from the payments table. */
export function getInvoicePaidAmount(invoice: InvoiceAmounts) {
  return Math.max(0, invoice.total_amount - invoice.remaining_balance);
}

export function getInvoicePaymentStatus(invoice: InvoiceAmounts): InvoicePaymentStatus {
  if (getInvoicePaidAmount(invoice) <= 0) {
    return 'unpaid';
  }

  return invoice.remaining_balance <= 0 ? 'paid' : 'partially-paid';
}
