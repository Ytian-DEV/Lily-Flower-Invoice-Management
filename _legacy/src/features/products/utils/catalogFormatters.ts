import { formatDate } from '@/utils/formatDate';

export function formatCatalogDate(value: string | null) {
  return value ? formatDate(value, 'MMM d, yyyy') : 'Not available';
}

export function formatPeso(value: number) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(value);
}
