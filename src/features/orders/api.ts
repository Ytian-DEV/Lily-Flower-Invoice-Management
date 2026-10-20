import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { queryKeys, unwrapRow } from '@/lib/queryClient';
import { pageRange, toIlikePattern } from '@/lib/search';
import { supabase } from '@/lib/supabase';
import {
  invoicesRepository,
  type OrderSavePayload,
} from '@/services/repositories/invoicesRepository';
import {
  paymentsRepository,
  type RecordPaymentPayload,
} from '@/services/repositories/paymentsRepository';
import { receiptPathFromImageUrl, removeFile } from '@/services/storage';
import type { InvoicePaymentState, InvoiceStatus } from '@/types/database';

export const ORDERS_PAGE_SIZE = 15;

export type OrderSort = 'newest' | 'delivery' | 'balance';

export interface OrderListFilters {
  search: string;
  status: InvoiceStatus | 'all' | 'open';
  /** `due` = anything with money still owed (unpaid or partly paid). */
  paymentState: InvoicePaymentState | 'all' | 'due';
  sort: OrderSort;
  page: number;
}

const orderListColumns =
  'id, invoice_number, customer_name, customer_phone, status, payment_state, delivery_date, total_amount, remaining_balance, created_at';

export type OrderListRow = {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_phone: string | null;
  status: InvoiceStatus;
  payment_state: InvoicePaymentState;
  delivery_date: string | null;
  total_amount: number;
  remaining_balance: number;
  created_at: string;
};

async function fetchOrders({
  page,
  paymentState,
  search,
  sort,
  status,
}: OrderListFilters) {
  const { from, to } = pageRange(page, ORDERS_PAGE_SIZE);
  let request = supabase
    .from('invoices')
    .select(orderListColumns, { count: 'exact' })
    .range(from, to);

  const pattern = toIlikePattern(search);
  if (pattern) {
    request = request.or(
      `invoice_number.ilike.${pattern},customer_name.ilike.${pattern},customer_phone.ilike.${pattern}`,
    );
  }

  if (status === 'open') {
    request = request.not('status', 'in', '(completed,cancelled)');
  } else if (status !== 'all') {
    request = request.eq('status', status);
  }

  if (paymentState === 'due') {
    request = request.neq('payment_state', 'paid').neq('status', 'cancelled');
  } else if (paymentState !== 'all') {
    request = request.eq('payment_state', paymentState);
  }

  if (sort === 'delivery') {
    request = request.order('delivery_date', { ascending: true, nullsFirst: false });
  } else if (sort === 'balance') {
    request = request.order('remaining_balance', { ascending: false });
  }

  const { count, data, error } = await request.order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return { rows: (data ?? []) as OrderListRow[], total: count ?? 0 };
}

export function useOrders(filters: OrderListFilters) {
  return useQuery({
    queryKey: [...queryKeys.orders, 'list', filters],
    queryFn: () => fetchOrders(filters),
    placeholderData: keepPreviousData,
  });
}

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.order(id ?? ''),
    enabled: Boolean(id),
    queryFn: async () => {
      const { data, error } = await invoicesRepository.getPreviewById(id ?? '');

      if (error || !data) {
        throw new Error(error?.message ?? 'Order not found.');
      }

      return data;
    },
  });
}

/** Signed links for every receipt on an order, fetched in one request. */
export function useReceiptLinks(receipts: { payment_id: string; image_url: string }[]) {
  const paths = receipts.map((receipt) => receiptPathFromImageUrl(receipt.image_url));

  return useQuery({
    queryKey: ['receipt-links', paths],
    enabled: paths.length > 0,
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from('receipts')
        .createSignedUrls(paths, 600);

      if (error) {
        throw new Error(error.message);
      }

      return Object.fromEntries(
        receipts.map((receipt, index) => [
          receipt.payment_id,
          data?.[index]?.signedUrl ?? '',
        ]),
      ) as Record<string, string>;
    },
  });
}

function useInvalidateOrders() {
  const client = useQueryClient();

  return () =>
    Promise.all([
      client.invalidateQueries({ queryKey: queryKeys.orders }),
      client.invalidateQueries({ queryKey: queryKeys.dashboard }),
      client.invalidateQueries({ queryKey: queryKeys.payments }),
      client.invalidateQueries({ queryKey: queryKeys.customers }),
    ]);
}

export function useCreateOrder() {
  const invalidate = useInvalidateOrders();

  return useMutation({
    mutationFn: async (payload: OrderSavePayload) =>
      unwrapRow(await invoicesRepository.createOrder(payload)),
    onSuccess: invalidate,
  });
}

export function useUpdateOrder(id: string) {
  const invalidate = useInvalidateOrders();

  return useMutation({
    mutationFn: async (payload: Omit<OrderSavePayload, 'payment'>) =>
      unwrapRow(await invoicesRepository.updateOrder(id, payload)),
    onSuccess: invalidate,
  });
}

export function useUpdateOrderStatus() {
  const invalidate = useInvalidateOrders();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: InvoiceStatus }) =>
      unwrapRow(await invoicesRepository.update(id, { status })),
    onSuccess: invalidate,
  });
}

export function useDeleteOrder() {
  const invalidate = useInvalidateOrders();

  return useMutation({
    mutationFn: async (id: string) => {
      const { count, error } = await supabase
        .from('invoices')
        .delete({ count: 'exact' })
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }

      if (!count) {
        throw new Error('Only an admin can delete orders.');
      }
    },
    onSuccess: invalidate,
  });
}

export function useRecordPayment() {
  const invalidate = useInvalidateOrders();

  return useMutation({
    mutationFn: async (payload: RecordPaymentPayload) => {
      const result = await paymentsRepository.record(payload);

      if (result.error && payload.receipt_path) {
        await removeFile('receipts', payload.receipt_path);
      }

      return unwrapRow(result);
    },
    onSuccess: invalidate,
  });
}
