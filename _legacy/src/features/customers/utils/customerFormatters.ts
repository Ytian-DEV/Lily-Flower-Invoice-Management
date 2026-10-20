import { formatDate } from '@/utils/formatDate';

export function normalizePhoneNumber(phoneNumber: string) {
  const trimmed = phoneNumber.trim().replace(/\s+/g, '');

  if (trimmed.startsWith('09')) {
    return `+63${trimmed.slice(1)}`;
  }

  return trimmed;
}

export function formatCustomerDate(value: string | null) {
  return value ? formatDate(value, 'MMM d, yyyy') : 'Not available';
}

export function createCustomerCode() {
  return `CUS-${Date.now().toString(36).toUpperCase()}`;
}
