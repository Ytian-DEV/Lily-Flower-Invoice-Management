import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import type { OrderListRow } from '@/features/orders/api';
import { queryKeys, unwrap } from '@/lib/queryClient';
import { pageRange, toIlikePattern } from '@/lib/search';
import { supabase } from '@/lib/supabase';
import { customersRepository } from '@/services/repositories/customersRepository';
import type { Database } from '@/types/database';
import type { CustomerFormValues } from '@/validation';

export const CUSTOMERS_PAGE_SIZE = 15;

export type CustomerSummary = Database['public']['Views']['customer_summaries']['Row'];

export interface CustomerFilters {
  search: string;
  segment: 'all' | 'balance' | 'recent';
  page: number;
}

export function useCustomers({ page, search, segment }: CustomerFilters) {
  return useQuery({
    queryKey: [...queryKeys.customers, 'list', { page, search, segment }],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const { from, to } = pageRange(page, CUSTOMERS_PAGE_SIZE);
      let request = supabase
        .from('customer_summaries')
        .select('*', { count: 'exact' })
        .range(from, to);

      const pattern = toIlikePattern(search);
      if (pattern) {
        request = request.or(
          `full_name.ilike.${pattern},phone_number.ilike.${pattern},delivery_address.ilike.${pattern}`,
        );
      }

      if (segment === 'balance') {
        request = request.gt('outstanding_balance', 0).order('outstanding_balance', {
          ascending: false,
        });
      } else if (segment === 'recent') {
        const since = new Date();
        since.setDate(since.getDate() - 30);
        request = request.gte('created_at', since.toISOString());
      }

      const { count, data, error } = await request
        .order('last_order_at', { ascending: false, nullsFirst: false })
        .order('full_name', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      return { rows: (data ?? []) as CustomerSummary[], total: count ?? 0 };
    },
  });
}

/** Lightweight lookup for the order form's customer picker. */
export function useCustomerLookup(search: string) {
  return useQuery({
    queryKey: [...queryKeys.customers, 'lookup', search],
    enabled: search.trim().length > 0,
    staleTime: 60_000,
    queryFn: async () => {
      const pattern = toIlikePattern(search);
      return unwrap(
        await supabase
          .from('customers')
          .select('id, full_name, phone_number, delivery_address, notes')
          .or(`full_name.ilike.${pattern},phone_number.ilike.${pattern}`)
          .order('full_name')
          .limit(8),
      );
    },
  });
}

export function useCustomerOrders(customerId: string | null) {
  return useQuery({
    queryKey: queryKeys.customer(customerId ?? ''),
    enabled: Boolean(customerId),
    queryFn: async () =>
      unwrap(
        await supabase
          .from('invoices')
          .select(
            'id, invoice_number, customer_name, customer_phone, status, payment_state, delivery_date, total_amount, remaining_balance, created_at',
          )
          .eq('customer_id', customerId ?? '')
          .order('created_at', { ascending: false })
          .limit(20),
      ) as OrderListRow[],
  });
}

function useInvalidateCustomers() {
  const client = useQueryClient();
  return () => client.invalidateQueries({ queryKey: queryKeys.customers });
}

export function useSaveCustomer() {
  const invalidate = useInvalidateCustomers();

  return useMutation({
    mutationFn: async ({ id, values }: { id?: string; values: CustomerFormValues }) =>
      unwrap(
        id
          ? await customersRepository.update(id, values)
          : await customersRepository.create(values),
      ),
    onSuccess: invalidate,
  });
}

export function useDeleteCustomer() {
  const invalidate = useInvalidateCustomers();

  return useMutation({
    mutationFn: async (id: string) => {
      const { count: orders } = await customersRepository.countInvoices(id);

      if (orders) {
        throw new Error('This customer has orders, so the record is kept for history.');
      }

      const { count, error } = await supabase
        .from('customers')
        .delete({ count: 'exact' })
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }

      if (!count) {
        throw new Error('Only an admin can delete customers.');
      }
    },
    onSuccess: invalidate,
  });
}
