import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';

export function formatOrderCurrency(value: number) {
  return formatCurrency(value);
}

export function formatOrderDate(value: string | null) {
  return value ? formatDate(value, 'MMM d, yyyy') : 'Not scheduled';
}
