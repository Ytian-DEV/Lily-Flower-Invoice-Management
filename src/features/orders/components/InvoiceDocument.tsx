import { forwardRef, useState, type ReactNode } from 'react';

import type { Order } from '@/features/orders';
import {
  getInvoicePaidAmount,
  getInvoicePaymentStatus,
  type InvoicePaymentStatus,
} from '@/features/orders/utils/paymentStatus';
import {
  formatOrderCurrency,
  formatOrderDate,
} from '@/features/orders/utils/orderFormatters';
import type {
  InvoiceAddonWithAddon,
  InvoiceItemWithProduct,
  InvoicePreviewPayment,
} from '@/services/repositories/invoicesRepository';
import type { PaymentMethod, TableRow } from '@/types/database';
import { cn } from '@/utils/cn';

interface InvoiceDocumentProps {
  customer?: TableRow<'customers'> | null;
  items?: InvoiceItemWithProduct[];
  addons?: InvoiceAddonWithAddon[];
  order: Order;
  payments?: InvoicePreviewPayment[];
  settings?: TableRow<'settings'> | null;
}

const paymentMethodLabels: Record<PaymentMethod, string> = {
  cash: 'Cash',
  gcash: 'GCash',
  bank_transfer: 'Bank Transfer',
  maribank: 'MariBank',
};

const paymentStatusLabels: Record<InvoicePaymentStatus, string> = {
  paid: 'Paid in full',
  'partially-paid': 'Partially paid',
  unpaid: 'Unpaid',
};

const fallbackBusiness = {
  name: 'Lily Flowers - Baybay City Branch',
  address: 'Purok 1, Santa Cruz, Baybay City, Leyte 6521',
  phones: '+639152111698 / +639613899028',
  facebook: 'Lily Flowers Baybay City',
};

function formatPercent(value: number) {
  return `${Number(value.toFixed(2))}%`;
}

function BusinessLogo() {
  const [isHidden, setIsHidden] = useState(false);

  if (isHidden) {
    return null;
  }

  return (
    <img
      src="/images/lily-logo.png"
      alt=""
      className="size-16 shrink-0 object-contain"
      onError={() => setIsHidden(true)}
    />
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-[0.7rem] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-slate-900">{children}</dd>
    </div>
  );
}

function TotalRow({
  label,
  value,
  emphasis = false,
}: {
  label: ReactNode;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex items-baseline justify-between gap-6 py-1.5 text-sm',
        emphasis && 'text-base font-semibold text-slate-950',
      )}
    >
      <dt className={emphasis ? undefined : 'text-slate-600'}>{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}

export const InvoiceDocument = forwardRef<HTMLElement, InvoiceDocumentProps>(
  function InvoiceDocument(
    { addons = [], customer, items = [], order, payments = [], settings },
    ref,
  ) {
    const businessName = settings?.business_name ?? fallbackBusiness.name;
    const businessAddress = settings?.business_address ?? fallbackBusiness.address;
    const phoneNumbers =
      [settings?.phone_1, settings?.phone_2].filter(Boolean).join(' / ') ||
      fallbackBusiness.phones;
    const facebook = settings ? settings.facebook : fallbackBusiness.facebook;
    const customerName = order.customer_name || customer?.full_name || 'Walk-in customer';
    const customerPhone = order.customer_phone ?? customer?.phone_number ?? null;
    const deliveryAddress = order.delivery_address ?? customer?.delivery_address ?? null;
    const paidAmount = getInvoicePaidAmount(order);
    const paymentStatus = getInvoicePaymentStatus(order);
    const sortedPayments = [...payments].sort(
      (left, right) =>
        left.payment_date.localeCompare(right.payment_date) ||
        left.created_at.localeCompare(right.created_at),
    );

    return (
      <article
        ref={ref}
        className="invoice-document mx-auto w-full max-w-4xl rounded-lg border border-slate-200 bg-white px-6 py-10 text-slate-900 shadow-sm sm:px-10 sm:py-12 print:max-w-none print:rounded-none print:border-0 print:p-0 print:shadow-none"
      >
        <header className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4">
            <BusinessLogo />
            <div>
              <p className="font-heading text-xl font-semibold text-slate-950">
                {businessName}
              </p>
              <address className="mt-2 space-y-0.5 text-sm not-italic leading-6 text-slate-600">
                <p>{businessAddress}</p>
                <p>{phoneNumbers}</p>
                {facebook ? <p>Facebook: {facebook}</p> : null}
              </address>
            </div>
          </div>

          <div className="sm:text-right">
            <p className="font-heading text-3xl font-semibold tracking-tight text-primary-dark">
              Invoice
            </p>
            <dl className="mt-3 grid grid-cols-[auto_auto] gap-x-6 gap-y-1 text-sm sm:justify-end">
              <dt className="text-slate-500">Invoice no.</dt>
              <dd className="font-semibold tabular-nums text-slate-950">
                {order.invoice_number}
              </dd>
              <dt className="text-slate-500">Date issued</dt>
              <dd className="tabular-nums">{formatOrderDate(order.created_at)}</dd>
            </dl>
          </div>
        </header>

        <dl className="mt-10 grid gap-6 border-y border-slate-200 py-6 sm:grid-cols-3">
          <Field label="Billed to">
            <p className="font-semibold">{customerName}</p>
            {customerPhone ? <p className="text-slate-600">{customerPhone}</p> : null}
          </Field>
          <Field label="Deliver to">
            {deliveryAddress ?? <span className="text-slate-500">For pickup</span>}
          </Field>
          <Field label="Delivery date">{formatOrderDate(order.delivery_date)}</Field>
        </dl>

        <table className="mt-8 w-full text-sm">
          <thead>
            <tr className="border-b border-slate-300 text-left text-[0.7rem] uppercase tracking-wider text-slate-500">
              <th className="pb-2 pr-4 font-semibold">Item</th>
              <th className="pb-2 pr-4 font-semibold">Color</th>
              <th className="pb-2 pr-4 text-right font-semibold">Qty</th>
              <th className="pb-2 pr-4 text-right font-semibold">Unit price</th>
              <th className="pb-2 text-right font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr className="border-b border-slate-100" key={item.id}>
                <td className="py-3 pr-4 font-medium text-slate-950">
                  {item.product_name ?? item.products?.product_name ?? 'Bouquet'}
                </td>
                <td className="py-3 pr-4 text-slate-600">
                  {item.custom_color_name || item.color_name || '—'}
                </td>
                <td className="py-3 pr-4 text-right tabular-nums">{item.quantity}</td>
                <td className="py-3 pr-4 text-right tabular-nums">
                  {formatOrderCurrency(item.unit_price)}
                </td>
                <td className="py-3 text-right tabular-nums">
                  {formatOrderCurrency(item.total_price)}
                </td>
              </tr>
            ))}
            {addons.map((addon) => (
              <tr className="border-b border-slate-100" key={addon.id}>
                <td className="py-3 pr-4 font-medium text-slate-950">
                  {addon.addon_name ?? addon.addons?.addon_name ?? 'Add-on'}
                </td>
                <td className="py-3 pr-4 text-slate-400">—</td>
                <td className="py-3 pr-4 text-right tabular-nums">{addon.quantity}</td>
                <td className="py-3 pr-4 text-right tabular-nums">
                  {formatOrderCurrency(addon.unit_price)}
                </td>
                <td className="py-3 text-right tabular-nums">
                  {formatOrderCurrency(addon.total_price)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6 grid gap-8 sm:grid-cols-[1fr_minmax(16rem,20rem)]">
          <div className="text-sm text-slate-600">
            {order.notes ? (
              <>
                <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-slate-500">
                  Notes
                </p>
                <p className="mt-1 whitespace-pre-line">{order.notes}</p>
              </>
            ) : null}
          </div>

          <div>
            <dl>
              <TotalRow label="Subtotal" value={formatOrderCurrency(order.subtotal)} />
              {order.discount_amount > 0 ? (
                <TotalRow
                  label={`Discount (${formatPercent(order.discount_percent)})`}
                  value={`-${formatOrderCurrency(order.discount_amount)}`}
                />
              ) : null}
              {order.delivery_fee > 0 ? (
                <TotalRow
                  label="Delivery fee"
                  value={formatOrderCurrency(order.delivery_fee)}
                />
              ) : null}
              <div className="mt-1 border-t border-slate-300 pt-1">
                <TotalRow
                  label="Total"
                  value={formatOrderCurrency(order.total_amount)}
                  emphasis
                />
              </div>
            </dl>

            {sortedPayments.length > 0 ? (
              <dl className="mt-3 border-t border-slate-200 pt-2">
                {sortedPayments.map((payment) => (
                  <TotalRow
                    key={payment.id}
                    label={
                      <>
                        Paid {formatOrderDate(payment.payment_date)} ·{' '}
                        {paymentMethodLabels[payment.payment_method]}
                        {payment.reference_number ? (
                          <span className="block text-xs text-slate-500">
                            Ref. {payment.reference_number}
                          </span>
                        ) : null}
                      </>
                    }
                    value={`-${formatOrderCurrency(payment.amount)}`}
                  />
                ))}
              </dl>
            ) : null}

            <div className="mt-3 flex items-baseline justify-between gap-6 rounded-md bg-accent/50 px-3 py-3">
              <span className="font-semibold text-slate-950">Balance due</span>
              <span className="text-lg font-semibold tabular-nums text-slate-950">
                {formatOrderCurrency(order.remaining_balance)}
              </span>
            </div>
            <p className="mt-2 text-right text-xs font-medium uppercase tracking-wider text-slate-500">
              {paymentStatusLabels[paymentStatus]}
              {paymentStatus === 'partially-paid'
                ? ` · ${formatOrderCurrency(paidAmount)} received`
                : null}
            </p>
          </div>
        </div>

        <footer className="mt-12 border-t border-slate-200 pt-6 text-center text-sm text-slate-500">
          Thank you for choosing {businessName.split(' - ')[0]}.
        </footer>
      </article>
    );
  },
);
