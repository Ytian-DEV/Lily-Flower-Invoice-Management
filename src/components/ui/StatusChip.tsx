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
    className: 'bg-amber-50 text-amber-700 ring-amber-200',
    icon: Clock,
  },
  confirmed: {
    label: 'Confirmed',
    className: 'bg-accent text-primary-dark ring-border',
    icon: CheckCircle2,
  },
  preparing: {
    label: 'Preparing',
    className: 'bg-pink-50 text-primary-dark ring-border',
    icon: PackageCheck,
  },
  ready: {
    label: 'Ready',
    className: 'bg-green-50 text-green-700 ring-green-200',
    icon: CheckCircle2,
  },
  'out-for-delivery': {
    label: 'Out for Delivery',
    className: 'bg-blue-50 text-blue-700 ring-blue-200',
    icon: Truck,
  },
  completed: {
    label: 'Completed',
    className: 'bg-green-50 text-green-700 ring-green-200',
    icon: CheckCircle2,
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-red-50 text-red-700 ring-red-200',
    icon: XCircle,
  },
  paid: {
    label: 'Paid',
    className: 'bg-green-50 text-green-700 ring-green-200',
    icon: CreditCard,
  },
  'partially-paid': {
    label: 'Partially Paid',
    className: 'bg-amber-50 text-amber-700 ring-amber-200',
    icon: CreditCard,
  },
  unpaid: {
    label: 'Unpaid',
    className: 'bg-red-50 text-red-700 ring-red-200',
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
