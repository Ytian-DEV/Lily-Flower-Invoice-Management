import { QueryClient } from '@tanstack/react-query';

/**
 * One cache for the whole app: pages show cached data instantly, refetch in the
 * background, and identical requests made at the same time are deduplicated.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 10 * 60_000,
      retry: 1,
      refetchOnWindowFocus: true,
    },
  },
});

/** Throws the Supabase error so React Query can surface it. */
export function unwrap<TData>(result: {
  data: TData;
  error: { message: string } | null;
}) {
  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data;
}

/** Like unwrap, but also fails when the call returned no row. */
export function unwrapRow<TData>(result: {
  data: TData | null;
  error: { message: string } | null;
}): TData {
  const data = unwrap(result);

  if (data === null || data === undefined) {
    throw new Error('The server returned no data.');
  }

  return data;
}

export const queryKeys = {
  dashboard: ['dashboard'] as const,
  orders: ['orders'] as const,
  order: (id: string) => ['orders', 'detail', id] as const,
  payments: ['payments'] as const,
  customers: ['customers'] as const,
  customer: (id: string) => ['customers', 'detail', id] as const,
  catalog: ['catalog'] as const,
  settings: ['settings'] as const,
};
