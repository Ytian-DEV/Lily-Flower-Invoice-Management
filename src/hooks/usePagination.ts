import { useMemo, useState } from 'react';

export interface UsePaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
  totalItems?: number;
}

export function usePagination({
  initialPage = 1,
  initialPageSize = 10,
  totalItems = 0,
}: UsePaginationOptions = {}) {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const pageCount = Math.max(1, Math.ceil(totalItems / pageSize));

  return useMemo(
    () => ({
      page,
      pageSize,
      pageCount,
      setPage,
      setPageSize,
      offset: (page - 1) * pageSize,
      limit: pageSize,
    }),
    [page, pageCount, pageSize],
  );
}
