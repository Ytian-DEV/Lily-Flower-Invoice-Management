import { useMemo } from 'react';

import { usePagination } from '@/hooks/usePagination';
import { useSearch } from '@/hooks/useSearch';
import { useTableState } from '@/hooks/useTableState';

export function useCrudPage(totalItems = 0) {
  const search = useSearch();
  const pagination = usePagination({ totalItems });
  const table = useTableState();

  return useMemo(
    () => ({
      search,
      pagination,
      table,
    }),
    [pagination, search, table],
  );
}
