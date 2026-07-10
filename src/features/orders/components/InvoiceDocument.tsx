import { forwardRef } from 'react';

import { Badge, StatusChip } from '@/components/ui';
import { LogoPlaceholder } from '@/components/layout/LogoPlaceholder';
import type { Order } from '@/features/orders';
import type {
  InvoiceAddonWithAddon,
  InvoiceItemWithProduct,
  InvoicePreviewPayment,
} from '@/services/repositories/invoicesRepository';
import {
  formatOrderCurrency,
  formatOrderDate,
} from '@/features/orders/utils/orderFormatters';
import type { TableRow } from '@/types/database';

interface InvoiceDocumentProps {
  customer?: TableRow<'customers'> | null;
  items?: InvoiceItemWithProduct[];
  addons?: InvoiceAddonWithAddon[];
  order: Order;
  payments?: InvoicePreviewPayment[];
  settings?: TableRow<'settings'> | null;
}

function normalizePaymentMethod(value: Order['payment_method']) {
  if (!value) {
    return 'NOT SELECTED';
  }

  if (value === 'cash') {
    return 'IN-CASH';
  }

  return value.replaceAll('_', ' ').toUpperCase();
}

function normalizeStatus(value: Order['status']) {
  return value.replaceAll('_', ' ').toUpperCase();
}

function paymentStatusFor(order: Order) {
  const paidAmount = Math.max(0, order.total_amount - order.remaining_balance);

  return paidAmount <= 0
    ? 'unpaid'
    : order.remaining_balance <= 0
      ? 'paid'
      : 'partially-paid';
}

function referenceNumberFor(
  paymentMethod: Order['payment_method'],
  payments: InvoicePreviewPayment[],
) {
  if (paymentMethod === 'cash') {
    return 'N/A';
  }

  const payment = payments
    .filter((item) => item.payment_method === paymentMethod)
    .sort((left, right) => right.created_at.localeCompare(left.created_at))[0];

  return payment?.reference_number || 'N/A';
}

function InvoiceDetail({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between gap-5 text-sm">
      <dt className="text-slate-500">{label}</dt>
      <dd className="max-w-72 text-right font-semibold text-slate-950">{value}</dd>
    </div>
  );
}

function invoiceItemColor(item: InvoiceItemWithProduct) {
  return item.custom_color_name || item.color_name || 'Not selected';
}

export const InvoiceDocument = forwardRef<HTMLElement, InvoiceDocumentProps>(
  function InvoiceDocument(
    { addons = [], customer, items = [], order, payments = [], settings },
    ref,
  ) {
    const paidAmount = Math.max(0, order.total_amount - order.remaining_balance);
    const businessName = settings?.business_name ?? 'Lily Flowers - Baybay City Branch';
    const branchName = 'Baybay City Branch';
    const phoneNumbers = [settings?.phone_1, settings?.phone_2]
      .filter(Boolean)
      .join(' / ');
    const paymentMethod = normalizePaymentMethod(order.payment_method);
    const referenceNumber = referenceNumberFor(order.payment_method, payments);
    const customerName = order.customer_name || customer?.full_name || 'Walk-in customer';

    return (
      <article
        ref={ref}
        className="invoice-document mx-auto w-full max-w-5xl rounded-lg border border-slate-200 bg-white p-8 text-slate-950 shadow-sm print:max-w-none print:rounded-none print:border-0 print:p-8 print:shadow-none"
      >
        <header className="grid gap-8 md:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="flex items-center gap-4">
              <LogoPlaceholder size="lg" />
              <div>
                <h2 className="font-heading text-2xl font-bold text-slate-950">
                  {businessName}
                </h2>
                <p className="mt-1 text-sm font-semibold text-slate-600">{branchName}</p>
              </div>
            </div>
            <div className="mt-4 max-w-xl space-y-1 text-sm leading-6 text-slate-600">
              <p>
                {settings?.business_address ??
                  'Purok 1, Santa Cruz, Baybay City, Leyte 6521'}
              </p>
              <p>{phoneNumbers || '+639152111698 / +639613899028'}</p>
              <p>{settings?.facebook ?? 'Lily Flowers Baybay City'}</p>
            </div>
          </div>

          <div className="text-left md:text-right">
            <p className="text-sm font-bold tracking-wide text-primary">INVOICE</p>
            <h1 className="mt-2 font-heading text-4xl font-bold text-slate-950">
              {order.invoice_number}
            </h1>
            <dl className="mt-4 space-y-2 text-sm">
              <InvoiceDetail
                label="Invoice Date"
                value={formatOrderDate(order.created_at)}
              />
              <div className="flex items-center justify-between gap-5 md:justify-end">
                <dt className="text-slate-500 md:hidden">Order Status</dt>
                <dd>
                  <StatusChip
                    status={
                      order.status === 'out_for_delivery'
                        ? 'out-for-delivery'
                        : order.status
                    }
                  />
                </dd>
              </div>
              <div className="flex items-center justify-between gap-5 md:justify-end">
                <dt className="text-slate-500 md:hidden">Payment Status</dt>
                <dd>
                  <StatusChip status={paymentStatusFor(order)} />
                </dd>
              </div>
            </dl>
          </div>
        </header>

        <div className="mt-7 h-px w-full bg-primary" />

        <section className="mt-8 grid gap-8 md:grid-cols-2">
          <div>
            <h3 className="text-sm font-bold uppercase text-slate-600">Customer</h3>
            <dl className="mt-4 space-y-3">
              <InvoiceDetail label="Customer Name" value={customerName} />
            </dl>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase text-slate-600">
              Delivery Information
            </h3>
            <dl className="mt-4 space-y-3">
              <InvoiceDetail
                label="Delivery Date"
                value={formatOrderDate(order.delivery_date)}
              />
              <InvoiceDetail
                label="Delivery Address"
                value={
                  order.delivery_address ??
                  customer?.delivery_address ??
                  'No delivery address'
                }
              />
              <InvoiceDetail label="Recipient" value={customerName} />
            </dl>
          </div>
        </section>

        <section className="mt-8 grid gap-8 md:grid-cols-2">
          <div>
            <h3 className="text-sm font-bold uppercase text-slate-600">
              Invoice Summary
            </h3>
            <dl className="mt-4 space-y-3">
              <InvoiceDetail label="Created" value={formatOrderDate(order.created_at)} />
              <InvoiceDetail label="Order Status" value={normalizeStatus(order.status)} />
              <InvoiceDetail label="Payment Method" value={paymentMethod} />
              <InvoiceDetail label="Notes" value={order.notes ?? 'None'} />
            </dl>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase text-slate-600">
              Downpayment Details
            </h3>
            <dl className="mt-4 space-y-3">
              <InvoiceDetail label="Mode of Payment" value={paymentMethod} />
              <InvoiceDetail label="Reference Number" value={referenceNumber} />
              <InvoiceDetail
                label="Downpayment"
                value={formatOrderCurrency(order.downpayment_amount)}
              />
            </dl>
          </div>
        </section>

        <section className="mt-8 overflow-hidden rounded-lg border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-left text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Description</th>
                <th className="px-4 py-3 text-right font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr className="border-t border-slate-200" key={item.id}>
                  <td className="px-4 py-3">
                    {item.products?.product_name ?? 'Bouquet'}
                    <div className="mt-1 text-xs text-slate-500">
                      {item.quantity} x {formatOrderCurrency(item.unit_price)}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      Color: {invoiceItemColor(item)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {formatOrderCurrency(item.total_price)}
                  </td>
                </tr>
              ))}
              {addons.map((addon) => (
                <tr className="border-t border-slate-200" key={addon.id}>
                  <td className="px-4 py-3">
                    {addon.addons?.addon_name ?? 'Add-on'}
                    <div className="mt-1 text-xs text-slate-500">
                      {addon.quantity} x {formatOrderCurrency(addon.unit_price)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {formatOrderCurrency(addon.total_price)}
                  </td>
                </tr>
              ))}
              <tr className="border-t border-slate-200">
                <td className="px-4 py-3">Subtotal</td>
                <td className="px-4 py-3 text-right">
                  {formatOrderCurrency(order.subtotal)}
                </td>
              </tr>
              <tr className="border-t border-slate-200">
                <td className="px-4 py-3">Discount</td>
                <td className="px-4 py-3 text-right">
                  -{formatOrderCurrency(order.discount_amount)}
                </td>
              </tr>
              <tr className="border-t border-slate-200">
                <td className="px-4 py-3">
                  <div>Downpayment</div>
                  <div className="mt-1 text-xs text-slate-500">
                    {paymentMethod} - Reference Number: {referenceNumber}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  {formatOrderCurrency(order.downpayment_amount)}
                </td>
              </tr>
              <tr className="border-t border-slate-200">
                <td className="px-4 py-3">Delivery Fee</td>
                <td className="px-4 py-3 text-right">
                  {formatOrderCurrency(order.delivery_fee)}
                </td>
              </tr>
              <tr className="border-t border-slate-200">
                <td className="px-4 py-4 text-base font-bold">Grand Total</td>
                <td className="px-4 py-4 text-right text-base font-bold">
                  {formatOrderCurrency(order.total_amount)}
                </td>
              </tr>
              <tr className="border-t border-slate-200">
                <td className="px-4 py-4 text-base font-bold">Paid Amount</td>
                <td className="px-4 py-4 text-right text-base font-bold">
                  {formatOrderCurrency(paidAmount)}
                </td>
              </tr>
              <tr className="border-t border-primary/30 bg-accent/30">
                <td className="px-4 py-5 text-xl font-bold">Remaining Balance</td>
                <td className="px-4 py-5 text-right text-xl font-bold">
                  {formatOrderCurrency(order.remaining_balance)}
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-6 text-sm text-slate-600">
          <span>Thank you for choosing Lily Flowers.</span>
          <Badge variant="info">Prepared for print, PDF, and image export</Badge>
        </footer>
      </article>
    );
  },
);
