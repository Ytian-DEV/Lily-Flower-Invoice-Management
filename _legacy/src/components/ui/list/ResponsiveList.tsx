import type { ReactNode } from 'react';

import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';

export interface ResponsiveListProps<TData> {
  data: TData[];
  getItemId: (item: TData, index: number) => string;
  renderItem: (item: TData) => ReactNode;
  isLoading?: boolean;
  emptyState?: ReactNode;
}

export function ResponsiveList<TData>({
  data,
  emptyState,
  getItemId,
  isLoading = false,
  renderItem,
}: ResponsiveListProps<TData>) {
  if (isLoading) {
    return (
      <div className="grid gap-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} variant="card" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return emptyState ?? <EmptyState title="No items found" />;
  }

  return (
    <div className="grid gap-3">
      {data.map((item, index) => (
        <div key={getItemId(item, index)}>{renderItem(item)}</div>
      ))}
    </div>
  );
}
