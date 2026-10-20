import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

import { queryKeys } from '@/lib/queryClient';
import { pageRange, toIlikePattern } from '@/lib/search';
import { supabase } from '@/lib/supabase';
import type { PaymentMethod } from '@/types/database';

export const PAYMENTS_PAGE_SIZE = 20;

export interface PaymentFilters {
  search: string;
  method: PaymentMethod | 'all';
  period: 'all' | 'month' | '30d';
  page: number;
}

export type PaymentRow = {
  id: string;
  amount: number;
  payment_method: PaymentMethod;
  payment_date: string;
  reference_number: string | null;
  invoices: {
    id: string;
    invoice_number: string;
    customer_name: string;
  } | null;
  payment_receipts: { id: string }[];
};

export function usePayments({ method, page, period, search }: PaymentFilters) {
  return useQuery({
    queryKey: [...queryKeys.payments, { method, page, period, search }],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const { from, to } = pageRange(page, PAYMENTS_PAGE_SIZE);
      const pattern = toIlikePattern(search);
      // An inner join lets the search filter on the invoice columns.
      let request = supabase
        .from('payments')
        .select(
          `id, amount, payment_method, payment_date, reference_number,
           invoices${pattern ? '!inner' : ''}(id, invoice_number, customer_name),
           payment_receipts(id)`,
          { count: 'exact' },
        )
        .order('payment_date', { ascending: false })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (pattern) {
        request = request.or(
          `invoice_number.ilike.${pattern},customer_name.ilike.${pattern}`,
          { referencedTable: 'invoices' },
        );
      }

      if (method !== 'all') {
        request = request.eq('payment_method', method);
      }

      if (period !== 'all') {
        const since = new Date();
        if (period === 'month') {
          since.setDate(1);
        } else {
          since.setDate(since.getDate() - 30);
        }
        request = request.gte('payment_date', format(since, 'yyyy-MM-dd'));
      }

      const { count, data, error } = await request;

      if (error) {
        throw new Error(error.message);
      }

      const rows = (data ?? []) as unknown as PaymentRow[];

      return {
        rows,
        total: count ?? 0,
        pageTotal: rows.reduce((sum, row) => sum + Number(row.amount), 0),
      };
    },
  });
}
