import { useMemo, useState } from 'react';

export type SortDirection = 'asc' | 'desc';

export interface SortState {
  columnId: string;
  direction: SortDirection;
}

export function useTableState() {
  const [sort, setSort] = useState<SortState | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  return useMemo(
    () => ({
      sort,
      setSort,
      selectedIds,
      setSelectedIds,
      clearSelection: () => setSelectedIds([]),
      hasSelection: selectedIds.length > 0,
    }),
    [selectedIds, sort],
  );
}
