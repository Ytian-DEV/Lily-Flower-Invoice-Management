import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { Button, LoadingScreen, StatusChip } from '@/components/ui';
import { CrudPageContainer, DetailViewLayout } from '@/features/crud';
import type { Order } from '@/features/orders';
import {
  formatOrderCurrency,
  formatOrderDate,
} from '@/features/orders/utils/orderFormatters';
import { invoicesRepository } from '@/services/repositories/invoicesRepository';
import type { InvoiceItemWithProduct } from '@/services/repositories/invoicesRepository';

export function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<InvoiceItemWithProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      return;
    }

    invoicesRepository.getPreviewById(id).then(({ data }) => {
      setOrder(data?.invoice ?? null);
      setItems(data?.items ?? []);
      setIsLoading(false);
    });
  }, [id]);

  if (isLoading) {
    return <LoadingScreen text="Loading order..." />;
  }

  if (!order) {
    return (
      <CrudPageContainer
        title="Order Not Found"
        subtitle="The requested order could not be loaded."
        primaryAction={
          <Button onClick={() => navigate('/orders')}>Back to Orders</Button>
        }
      />
    );
  }

  return (
    <CrudPageContainer
      title={order.invoice_number}
      subtitle="Order and invoice details."
      primaryAction={
        <Button onClick={() => navigate(`/orders/${order.id}/edit`)}>Edit Order</Button>
      }
      secondaryAction={
        <Button variant="outline" onClick={() => navigate(`/orders/${order.id}/preview`)}>
          Preview
        </Button>
      }
      tableSlot={
        <DetailViewLayout
          title={order.invoice_number}
          status={
            <StatusChip
              status={
                order.status === 'out_for_delivery' ? 'out-for-delivery' : order.status
              }
            />
          }
          sections={[
            {
              title: 'Bouquets',
              items:
                items.length > 0
                  ? items.map((item) => ({
                      label: item.products?.product_name ?? 'Bouquet',
                      value: item.custom_color_name || item.color_name || 'No color',
                    }))
                  : [{ label: 'Bouquet Color', value: 'No bouquet lines' }],
            },
            {
              title: 'Order Summary',
              items: [
                { label: 'Status', value: order.status },
                {
                  label: 'Payment Method',
                  value: order.payment_method ?? 'Not selected',
                },
                { label: 'Delivery Date', value: formatOrderDate(order.delivery_date) },
                {
                  label: 'Delivery Address',
                  value: order.delivery_address ?? 'No address',
                },
                { label: 'Total Amount', value: formatOrderCurrency(order.total_amount) },
                {
                  label: 'Remaining Balance',
                  value: formatOrderCurrency(order.remaining_balance),
                },
                { label: 'Created Date', value: formatOrderDate(order.created_at) },
              ],
            },
          ]}
        />
      }
    />
  );
}
