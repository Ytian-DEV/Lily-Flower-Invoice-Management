import type { TableRow } from '@/types/database';

export type Customer = TableRow<'customers'>;
export type CustomerDialogMode = 'create' | 'edit' | 'details';

export interface CustomerFilters {
  hasOutstandingBalance: boolean;
  hasOrders: boolean;
  recentlyAdded: boolean;
}
