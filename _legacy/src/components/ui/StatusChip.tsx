import {
  CheckCircle2,
  Clock,
  CreditCard,
  PackageCheck,
  Truck,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/utils/cn';
import { statusToneClasses } from '@/design-system';

export type StatusChipStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'out-for-delivery'
  | 'completed'
  | 'cancelled'
  | 'paid'
  | 'partially-paid'
  | 'unpaid';

export interface StatusChipProps {
  status: StatusChipStatus;
  icon?: ReactNode;
  label?: string;
}

interface StatusConfig {
  label: string;
  className: string;
  icon: LucideIcon;
}

const statusConfig: Record<StatusChipStatus, StatusConfig> = {
  pending: {
    label: 'Pending',
    className: statusToneClasses.pending,
    icon: Clock,
  },
  confirmed: {
    label: 'Confirmed',
    className: statusToneClasses.confirmed,
    icon: CheckCircle2,
  },
  preparing: {
    label: 'Preparing',
    className: statusToneClasses.preparing,
    icon: PackageCheck,
  },
  ready: {
    label: 'Ready',
    className: statusToneClasses.ready,
    icon: CheckCircle2,
  },
  'out-for-delivery': {
    label: 'Out for Delivery',
    className: statusToneClasses.outForDelivery,
    icon: Truck,
  },
  completed: {
    label: 'Completed',
    className: statusToneClasses.completed,
    icon: CheckCircle2,
  },
  cancelled: {
    label: 'Cancelled',
    className: statusToneClasses.cancelled,
    icon: XCircle,
  },
  paid: {
    label: 'Paid',
    className: statusToneClasses.paid,
    icon: CreditCard,
  },
  'partially-paid': {
    label: 'Partially Paid',
    className: statusToneClasses.partiallyPaid,
    icon: CreditCard,
  },
  unpaid: {
    label: 'Unpaid',
    className: statusToneClasses.unpaid,
    icon: CreditCard,
  },
};

export function StatusChip({ icon, label, status }: StatusChipProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex min-h-8 items-center gap-2 rounded-full px-3 text-xs font-semibold ring-1',
        config.className,
      )}
    >
      {icon ?? <Icon aria-hidden="true" className="size-4" />}
      {label ?? config.label}
    </span>
  );
}
