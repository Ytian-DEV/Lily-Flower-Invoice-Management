import { useEffect, useState } from 'react';
import { useParams } from 'react-router';

import {
  Alert,
  Card,
  CardBody,
  KeyValueDisplay,
  LoadingScreen,
  SectionHeader,
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

  return (
    <CrudPageContainer
      title="Invoice Preview"
      subtitle="Preview rendering is prepared here. PDF and image export belong to later volumes."
      tableSlot={
        <Card variant="elevated">
          <CardBody className="space-y-5">
            <Alert
              variant="info"
              title="Preview placeholder"
              description="This route receives generated invoices. Final print/PDF/PNG rendering will be implemented later."
            />
            {order ? (
              <>
                <SectionHeader title={order.invoice_number} showDivider={false} />
                <KeyValueDisplay
                  items={[
                    {
                      label: 'Delivery Date',
                      value: formatOrderDate(order.delivery_date),
                    },
                    {
                      label: 'Delivery Address',
                      value: order.delivery_address ?? 'No address',
                    },
                    {
                      label: 'Total Amount',
                      value: formatOrderCurrency(order.total_amount),
                    },
                    {
                      label: 'Downpayment',
                      value: formatOrderCurrency(order.downpayment_amount),
                    },
                    {
                      label: 'Remaining Balance',
                      value: formatOrderCurrency(order.remaining_balance),
                    },
                    { label: 'Status', value: order.status },
                  ]}
                />
              </>
            ) : null}
          </CardBody>
        </Card>
      }
    />
  );
}
