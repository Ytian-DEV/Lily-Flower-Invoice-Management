import { useState } from 'react';
import {
  ArrowRight,
  FileText,
  MapPin,
  Pencil,
  Phone,
  Receipt,
  Trash2,
  Wallet,
} from 'lucide-react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router';

import { PageContainer } from '@/components/layout/PageContainer';
import {
  Button,
  ButtonLink,
  Card,
  CardHeader,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  LoadingScreen,
  Menu,
  OrderStatusBadge,
  PageHeader,
  PaymentStateBadge,
  Select,
  orderStatusLabels,
  useToast,
} from '@/components/ui';
import { useAuth } from '@/features/auth';
import {
  useDeleteOrder,
  useOrder,
  useReceiptLinks,
  useUpdateOrderStatus,
} from '@/features/orders/api';
import { RecordPaymentModal } from '@/features/orders/components/RecordPaymentModal';
import { paymentMethodLabels } from '@/lib/labels';
import type { InvoiceStatus } from '@/types/database';
import { cn } from '@/utils/cn';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatPhone } from '@/utils/formatPhone';
import { formatDate, formatRelativeDay } from '@/utils/formatDate';

const nextStatus: Partial<Record<InvoiceStatus, InvoiceStatus>> = {
  pending: 'confirmed',
  confirmed: 'preparing',
  preparing: 'ready',
  ready: 'out_for_delivery',
  out_for_delivery: 'completed',
};

const statusOptions = (Object.keys(orderStatusLabels) as InvoiceStatus[]).map(
  (status) => ({
    value: status,
    label: orderStatusLabels[status],
  }),
);

function SummaryRow({
  divided,
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
  /** Draws a rule above the row (for totals); keeps <dt>/<dd> direct children of the row. */
  divided?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex items-baseline justify-between gap-4 py-1 text-sm',
        divided && 'mt-1 border-t border-border pt-2',
      )}
    >
      <dt className={strong ? 'font-medium text-text' : 'text-muted'}>{label}</dt>
      <dd
        className={
          strong ? 'font-semibold text-text tabular-nums' : 'text-text tabular-nums'
        }
      >
        {value}
      </dd>
    </div>
  );
}

export function OrderDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { isAdmin } = useAuth();
  const [params, setParams] = useSearchParams();
  const order = useOrder(id);
  const updateStatus = useUpdateOrderStatus();
  const deleteOrder = useDeleteOrder();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const isPaymentOpen = params.get('pay') === '1';
  const payments = order.data?.payments ?? [];
  const receipts = payments.flatMap((payment) =>
    (payment.payment_receipts ?? []).map((receipt) => ({
      payment_id: payment.id,
      image_url: receipt.image_url,
    })),
  );
  const receiptLinks = useReceiptLinks(receipts);

  const setPaymentOpen = (open: boolean) =>
    setParams(
      (current) => {
        const next = new URLSearchParams(current);
        if (open) next.set('pay', '1');
        else next.delete('pay');
        return next;
      },
      { replace: true },
    );

  if (order.isPending) {
    return <LoadingScreen label="Loading order" />;
  }

  if (order.isError) {
    return (
      <PageContainer size="narrow">
        <ErrorState
          title="This order could not be loaded"
          description={order.error.message}
          onRetry={() => order.refetch()}
        />
      </PageContainer>
    );
  }

  const { addons, customer, invoice, items } = order.data;
  const paid = Math.max(0, invoice.total_amount - invoice.remaining_balance);
  const canTakePayment = invoice.remaining_balance > 0 && invoice.status !== 'cancelled';
  const upcomingStatus = nextStatus[invoice.status];
  const phone = invoice.customer_phone ?? customer?.phone_number;
  const sortedPayments = [...payments].sort((left, right) =>
    right.payment_date.localeCompare(left.payment_date),
  );

  const changeStatus = async (status: InvoiceStatus) => {
    try {
      await updateStatus.mutateAsync({ id: invoice.id, status });
      showToast({ variant: 'success', title: `Marked as ${orderStatusLabels[status]}` });
    } catch (error) {
      showToast({
        variant: 'error',
        title: 'Status was not changed',
        description: error instanceof Error ? error.message : undefined,
      });
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteOrder.mutateAsync(invoice.id);
      showToast({ variant: 'success', title: `${invoice.invoice_number} deleted` });
      navigate('/orders', { replace: true });
    } catch (error) {
      setIsDeleteOpen(false);
      showToast({
        variant: 'error',
        title: 'Order was not deleted',
        description: error instanceof Error ? error.message : undefined,
      });
    }
  };

  return (
    <PageContainer>
      <PageHeader
        back={{ to: '/orders', label: 'Orders' }}
        title={<span className="tabular-nums">{invoice.invoice_number}</span>}
        meta={
          <>
            <OrderStatusBadge status={invoice.status} />
            <PaymentStateBadge state={invoice.payment_state} />
          </>
        }
        description={`Created ${formatDate(invoice.created_at, "MMM d, yyyy 'at' h:mm a")}`}
        actions={
          <>
            <ButtonLink
              to={`/orders/${invoice.id}/invoice`}
              variant="secondary"
              leftIcon={<FileText aria-hidden="true" className="size-4" />}
            >
              Invoice
            </ButtonLink>
            <ButtonLink
              to={`/orders/${invoice.id}/edit`}
              variant="secondary"
              leftIcon={<Pencil aria-hidden="true" className="size-4" />}
            >
              Edit
            </ButtonLink>
            {canTakePayment ? (
              <Button
                leftIcon={<Wallet aria-hidden="true" className="size-4" />}
                onClick={() => setPaymentOpen(true)}
              >
                Record payment
              </Button>
            ) : null}
            <Menu
              items={[
                {
                  label: 'Delete order',
                  icon: <Trash2 aria-hidden="true" />,
                  isDanger: true,
                  hidden: !isAdmin,
                  onSelect: () => setIsDeleteOpen(true),
                },
              ]}
            />
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="grid content-start gap-6 lg:col-span-2">
          <Card>
            <CardHeader title="Items" />
            <div className="overflow-x-auto border-t border-border">
              <table className="w-full text-sm">
                <thead className="bg-surface-muted text-xs text-muted">
                  <tr>
                    <th scope="col" className="py-2 pr-3 pl-5 text-left font-medium">
                      Item
                    </th>
                    <th
                      scope="col"
                      className="hidden px-3 py-2 text-left font-medium sm:table-cell"
                    >
                      Color
                    </th>
                    <th scope="col" className="px-3 py-2 text-right font-medium">
                      Qty
                    </th>
                    <th
                      scope="col"
                      className="hidden px-3 py-2 text-right font-medium sm:table-cell"
                    >
                      Price
                    </th>
                    <th scope="col" className="py-2 pr-5 pl-3 text-right font-medium">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-3 pr-3 pl-5">
                        <p className="font-medium text-text">
                          {item.product_name ?? item.products?.product_name ?? 'Bouquet'}
                        </p>
                        <p className="text-xs text-muted sm:hidden">
                          {item.custom_color_name || item.color_name || 'No color'}
                        </p>
                      </td>
                      <td className="hidden px-3 py-3 text-muted sm:table-cell">
                        {item.custom_color_name || item.color_name || '—'}
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums">
                        {item.quantity}
                      </td>
                      <td className="hidden px-3 py-3 text-right tabular-nums sm:table-cell">
                        {formatCurrency(item.unit_price)}
                      </td>
                      <td className="py-3 pr-5 pl-3 text-right tabular-nums">
                        {formatCurrency(item.total_price)}
                      </td>
                    </tr>
                  ))}
                  {addons.map((addon) => (
                    <tr key={addon.id}>
                      <td className="py-3 pr-3 pl-5">
                        <p className="text-text">
                          {addon.addon_name ?? addon.addons?.addon_name ?? 'Add-on'}
                        </p>
                        <p className="text-xs text-muted">Add-on</p>
                      </td>
                      <td className="hidden px-3 py-3 text-subtle sm:table-cell">—</td>
                      <td className="px-3 py-3 text-right tabular-nums">
                        {addon.quantity}
                      </td>
                      <td className="hidden px-3 py-3 text-right tabular-nums sm:table-cell">
                        {formatCurrency(addon.unit_price)}
                      </td>
                      <td className="py-3 pr-5 pl-3 text-right tabular-nums">
                        {formatCurrency(addon.total_price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <dl className="ml-auto max-w-xs border-t border-border px-5 py-3">
              <SummaryRow label="Subtotal" value={formatCurrency(invoice.subtotal)} />
              {invoice.discount_amount > 0 ? (
                <SummaryRow
                  label={`Discount (${Number(invoice.discount_percent)}%)`}
                  value={`-${formatCurrency(invoice.discount_amount)}`}
                />
              ) : null}
              {invoice.delivery_fee > 0 ? (
                <SummaryRow
                  label="Delivery fee"
                  value={formatCurrency(invoice.delivery_fee)}
                />
              ) : null}
              <SummaryRow
                label="Total"
                value={formatCurrency(invoice.total_amount)}
                strong
                divided
              />
            </dl>
          </Card>

          <Card>
            <CardHeader
              title="Payments"
              description={`${formatCurrency(paid)} of ${formatCurrency(invoice.total_amount)} received`}
              action={
                canTakePayment ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPaymentOpen(true)}
                  >
                    Record payment
                  </Button>
                ) : null
              }
            />
            <div className="px-5">
              <div className="h-1.5 overflow-hidden rounded-full bg-black/[0.06]">
                <div
                  className="h-full rounded-full bg-success"
                  style={{
                    width: `${invoice.total_amount > 0 ? Math.min(100, (paid / invoice.total_amount) * 100) : 0}%`,
                  }}
                />
              </div>
            </div>
            {sortedPayments.length ? (
              <ul className="mt-3 divide-y divide-border border-t border-border">
                {sortedPayments.map((payment) => {
                  const link = receiptLinks.data?.[payment.id];
                  return (
                    <li
                      key={payment.id}
                      className="flex items-center gap-3 px-5 py-3 text-sm"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-text">
                          {paymentMethodLabels[payment.payment_method]}
                          <span className="font-normal text-muted">
                            {' · '}
                            {formatDate(payment.payment_date, 'MMM d, yyyy')}
                          </span>
                        </p>
                        {payment.reference_number ? (
                          <p className="text-xs text-muted tabular-nums">
                            Ref. {payment.reference_number}
                          </p>
                        ) : null}
                      </div>
                      {link ? (
                        <a
                          href={link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-primary-dark hover:underline"
                        >
                          <Receipt aria-hidden="true" className="size-3.5" />
                          Receipt
                        </a>
                      ) : null}
                      <span className="w-24 text-right font-medium tabular-nums">
                        {formatCurrency(payment.amount)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <EmptyState
                icon={<Wallet aria-hidden="true" />}
                title="No payments yet"
                description="Downpayments and later payments appear here."
              />
            )}
            <div className="flex items-baseline justify-between border-t border-border bg-surface-muted px-5 py-3 rounded-b-xl">
              <span className="text-sm font-medium text-text">Balance due</span>
              <span className="text-base font-semibold tabular-nums text-text">
                {formatCurrency(invoice.remaining_balance)}
              </span>
            </div>
          </Card>

          {invoice.notes ? (
            <Card>
              <CardHeader title="Notes" />
              <p className="px-5 pb-5 text-sm whitespace-pre-line text-text">
                {invoice.notes}
              </p>
            </Card>
          ) : null}
        </div>

        <div className="grid content-start gap-6">
          <Card>
            <CardHeader title="Status" />
            <div className="grid gap-3 px-5 pb-5">
              <Select
                aria-label="Order status"
                value={invoice.status}
                disabled={updateStatus.isPending}
                onChange={(event) => changeStatus(event.target.value as InvoiceStatus)}
                options={statusOptions}
              />
              {upcomingStatus ? (
                <Button
                  variant="soft"
                  fullWidth
                  isLoading={updateStatus.isPending}
                  rightIcon={<ArrowRight aria-hidden="true" className="size-4" />}
                  onClick={() => changeStatus(upcomingStatus)}
                >
                  Mark as {orderStatusLabels[upcomingStatus].toLowerCase()}
                </Button>
              ) : null}
            </div>
          </Card>

          <Card>
            <CardHeader title="Customer" />
            <div className="grid gap-2 px-5 pb-5 text-sm">
              <p className="font-medium text-text">{invoice.customer_name}</p>
              {phone ? (
                <a
                  href={`tel:${phone}`}
                  className="inline-flex items-center gap-2 text-muted hover:text-text"
                >
                  <Phone aria-hidden="true" className="size-4 text-subtle" />
                  <span className="tabular-nums">{formatPhone(phone)}</span>
                </a>
              ) : null}
              {customer ? (
                <Link
                  to={`/customers?q=${encodeURIComponent(customer.full_name)}`}
                  className="text-sm font-medium text-primary-dark hover:underline"
                >
                  View customer
                </Link>
              ) : (
                <p className="text-xs text-muted">Walk-in, not saved as a customer</p>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader title="Delivery" />
            <div className="grid gap-2 px-5 pb-5 text-sm">
              <p className="font-medium text-text">
                {invoice.delivery_date
                  ? `${formatRelativeDay(invoice.delivery_date)} · ${formatDate(invoice.delivery_date, 'MMM d, yyyy')}`
                  : 'No date set'}
              </p>
              <p className="flex gap-2 text-muted">
                <MapPin
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-subtle"
                />
                {invoice.delivery_address ?? 'For pickup'}
              </p>
            </div>
          </Card>
        </div>
      </div>

      <RecordPaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setPaymentOpen(false)}
        invoiceId={invoice.id}
        invoiceNumber={invoice.invoice_number}
        balanceDue={invoice.remaining_balance}
      />

      <ConfirmDialog
        isOpen={isDeleteOpen}
        title={`Delete ${invoice.invoice_number}?`}
        description="The order, its items and its payments are removed permanently. To keep history, set the status to Cancelled instead."
        confirmLabel="Delete order"
        isDanger
        isLoading={deleteOrder.isPending}
        onCancel={() => setIsDeleteOpen(false)}
        onConfirm={confirmDelete}
      />
    </PageContainer>
  );
}
