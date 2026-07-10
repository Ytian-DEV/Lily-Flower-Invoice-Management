import type { ReactNode } from 'react';

import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/utils/cn';

export interface DataGridProps<TData> {
  data: TData[];
  getItemId: (item: TData, index: number) => string;
  renderItem: (item: TData) => ReactNode;
  isLoading?: boolean;
  emptyState?: ReactNode;
  columns?: 'auto' | 2 | 3 | 4;
}

const columnClasses = {
  auto: 'grid-cols-[repeat(auto-fit,minmax(16rem,1fr))]',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 xl:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
};

export function DataGrid<TData>({
  columns = 'auto',
  data,
  emptyState,
  getItemId,
  isLoading = false,
  renderItem,
}: DataGridProps<TData>) {
  if (isLoading) {
    return (
      <div className={cn('grid gap-4', columnClasses[columns])}>
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} variant="card" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return emptyState ?? <EmptyState title="No items found" />;
  }

  return (
    <div className={cn('grid gap-4', columnClasses[columns])}>
      {data.map((item, index) => (
        <div key={getItemId(item, index)}>{renderItem(item)}</div>
      ))}
    </div>
  );
}
