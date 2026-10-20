import { useMemo, useState } from 'react';

export function useBulkSelection(initialIds: string[] = []) {
  const [selectedIds, setSelectedIds] = useState(initialIds);

  return useMemo(
    () => ({
      selectedIds,
      setSelectedIds,
      clearSelection: () => setSelectedIds([]),
      isSelected: (id: string) => selectedIds.includes(id),
      toggleSelection: (id: string) =>
        setSelectedIds((current) =>
          current.includes(id)
            ? current.filter((selectedId) => selectedId !== id)
            : [...current, id],
        ),
    }),
    [selectedIds],
  );
}
