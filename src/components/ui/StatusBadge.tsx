import { Badge, type BadgeTone } from '@/components/ui/Badge';
import { orderStatusLabels, paymentStateLabels } from '@/lib/labels';
import type { InvoicePaymentState, InvoiceStatus } from '@/types/database';

const orderStatusTones: Record<InvoiceStatus, BadgeTone> = {
  pending: 'warning',
  confirmed: 'brand',
  preparing: 'brand',
  ready: 'info',
  out_for_delivery: 'info',
  completed: 'success',
  cancelled: 'neutral',
};

const paymentStateTones: Record<InvoicePaymentState, BadgeTone> = {
  unpaid: 'danger',
  partially_paid: 'warning',
  paid: 'success',
};

export function OrderStatusBadge({ status }: { status: InvoiceStatus }) {
  return (
    <Badge tone={orderStatusTones[status]} withDot>
      {orderStatusLabels[status]}
    </Badge>
  );
}

export function PaymentStateBadge({ state }: { state: InvoicePaymentState }) {
  return <Badge tone={paymentStateTones[state]}>{paymentStateLabels[state]}</Badge>;
}
