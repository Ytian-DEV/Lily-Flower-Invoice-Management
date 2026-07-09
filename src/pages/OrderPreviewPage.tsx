import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Download, Printer } from 'lucide-react';

import {
  Badge,
  Button,
  Card,
  CardBody,
  LoadingScreen,
  StatusChip,
} from '@/components/ui';
import { CrudPageContainer } from '@/features/crud';
import type { Order } from '@/features/orders';
import {
  formatOrderCurrency,
  formatOrderDate,
} from '@/features/orders/utils/orderFormatters';
import { invoicesRepository } from '@/services/repositories/invoicesRepository';

export function OrderPreviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      return;
    }

    invoicesRepository.getById(id).then(({ data }) => {
      setOrder(data ?? null);
      setIsLoading(false);
    });
  }, [id]);

  if (isLoading) {
    return <LoadingScreen text="Loading invoice preview..." />;
  }

  if (!order) {
    return (
      <CrudPageContainer
        title="Invoice Not Found"
        subtitle="The requested invoice could not be loaded."
        primaryAction={
          <Button onClick={() => navigate('/orders')}>Back to Orders</Button>
        }
      />
    );
  }

  const paidAmount = Math.max(0, order.total_amount - order.remaining_balance);
  const paymentStatus =
    paidAmount <= 0 ? 'unpaid' : order.remaining_balance <= 0 ? 'paid' : 'partially-paid';

  return (
    <CrudPageContainer
      title="Invoice Preview"
      subtitle="Printable invoice rendering and browser export preview."
      primaryAction={
        <Button leftIcon={<Printer className="size-4" />} onClick={() => window.print()}>
          Print
        </Button>
      }
      secondaryAction={
        <Button
          variant="outline"
          leftIcon={<Download className="size-4" />}
          onClick={() => window.print()}
        >
          Export PDF
        </Button>
      }
      tableSlot={
        <Card variant="elevated" className="print:shadow-none">
          <CardBody className="bg-white p-6 text-slate-950 print:p-0">
            <div className="mx-auto max-w-4xl space-y-8 rounded-lg border border-slate-200 p-8 print:border-0">
              <div className="flex flex-wrap items-start justify-between gap-6 border-b border-slate-200 pb-6">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wide text-primary-dark">
                    Lily Flowers
                  </p>
                  <h2 className="mt-2 text-3xl font-bold text-slate-950">
                    {order.invoice_number}
                  </h2>
                  <p className="mt-2 text-sm text-slate-600">Baybay City Branch</p>
                </div>
                <div className="text-left sm:text-right">
                  <StatusChip
                    status={
                      order.status === 'out_for_delivery'
                        ? 'out-for-delivery'
                        : order.status
                    }
                  />
                  <div className="mt-3">
                    <StatusChip status={paymentStatus} />
                  </div>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="text-sm font-bold uppercase text-slate-500">
                    Delivery Details
                  </h3>
                  <dl className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-500">Date</dt>
                      <dd className="font-semibold">
                        {formatOrderDate(order.delivery_date)}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-500">Address</dt>
                      <dd className="max-w-64 text-right font-semibold">
                        {order.delivery_address ?? 'No address'}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-500">Payment Method</dt>
                      <dd className="font-semibold">
                        {order.payment_method?.replace('_', ' ') ?? 'Not selected'}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="text-sm font-bold uppercase text-slate-500">
                    Invoice Summary
                  </h3>
                  <dl className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-500">Created</dt>
                      <dd className="font-semibold">
                        {formatOrderDate(order.created_at)}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-500">Order Status</dt>
                      <dd className="font-semibold">
                        {order.status.replaceAll('_', ' ')}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-500">Notes</dt>
                      <dd className="max-w-64 text-right font-semibold">
                        {order.notes ?? 'None'}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="overflow-hidden rounded-lg border border-slate-200">
                <table className="w-full text-sm">
                  <thead className="bg-slate-100 text-left text-slate-600">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Description</th>
                      <th className="px-4 py-3 text-right font-semibold">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-slate-200">
                      <td className="px-4 py-3">Order subtotal</td>
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
                      <td className="px-4 py-3">Delivery fee</td>
                      <td className="px-4 py-3 text-right">
                        {formatOrderCurrency(order.delivery_fee)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="ml-auto grid max-w-sm gap-3">
                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-slate-500">Total Amount</span>
                  <strong>{formatOrderCurrency(order.total_amount)}</strong>
                </div>
                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-slate-500">Paid Amount</span>
                  <strong>{formatOrderCurrency(paidAmount)}</strong>
                </div>
                <div className="flex justify-between gap-4 border-t border-slate-200 pt-3 text-lg">
                  <span className="font-bold">Remaining Balance</span>
                  <strong>{formatOrderCurrency(order.remaining_balance)}</strong>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-6 text-sm text-slate-600">
                <span>Thank you for choosing Lily Flowers.</span>
                <Badge variant="info">Prepared for print, PDF, and image export</Badge>
              </div>
            </div>
          </CardBody>
        </Card>
      }
    />
  );
}
