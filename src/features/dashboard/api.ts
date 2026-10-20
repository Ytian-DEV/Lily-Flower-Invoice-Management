import { useQuery } from '@tanstack/react-query';

import { type OrderListRow } from '@/features/orders/api';
import { queryKeys, unwrap } from '@/lib/queryClient';
import { supabase } from '@/lib/supabase';
import { manilaToday, shiftDate } from '@/utils/formatDate';

const listColumns =
  'id, invoice_number, customer_name, customer_phone, status, payment_state, delivery_date, total_amount, remaining_balance, created_at';

/** Every headline number comes from one SQL function computed over all rows. */
export function useDashboardSummary() {
  return useQuery({
    queryKey: [...queryKeys.dashboard, 'summary'],
    queryFn: async () => unwrap(await supabase.rpc('dashboard_summary')),
    refetchInterval: 60_000,
  });
}

export function useUpcomingDeliveries() {
  return useQuery({
    queryKey: [...queryKeys.dashboard, 'deliveries'],
    queryFn: async () => {
      const today = manilaToday();
      const rows = unwrap(
        await supabase
          .from('invoices')
          .select(listColumns)
          .gte('delivery_date', today)
          .lte('delivery_date', shiftDate(today, 6))
          .not('status', 'in', '(completed,cancelled)')
          .order('delivery_date', { ascending: true })
          .limit(8),
      );

      return rows as OrderListRow[];
    },
    refetchInterval: 60_000,
  });
}

export function useRecentOrders() {
  return useQuery({
    queryKey: [...queryKeys.dashboard, 'recent'],
    queryFn: async () =>
      unwrap(
        await supabase
          .from('invoices')
          .select(listColumns)
          .order('created_at', { ascending: false })
          .limit(6),
      ) as OrderListRow[],
    refetchInterval: 60_000,
  });
}
