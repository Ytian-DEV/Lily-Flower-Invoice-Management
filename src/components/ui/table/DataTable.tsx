import type { ReactNode } from 'react';

import { EmptyTable } from '@/components/ui/table/EmptyTable';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/utils/cn';

export interface DataTableColumn<TData> {
  id: string;
  header: ReactNode;
  accessor?: keyof TData;
  cell?: (row: TData) => ReactNode;
  align?: 'left' | 'center' | 'right';
  isSortable?: boolean;
  className?: string;
}

export interface DataTableProps<TData> {
  columns: DataTableColumn<TData>[];
  data: TData[];
  getRowId: (row: TData, index: number) => string;
  isLoading?: boolean;
  error?: string;
  emptyState?: ReactNode;
  actions?: (row: TData) => ReactNode;
  onRowClick?: (row: TData) => void;
  zebraRows?: boolean;
  stickyHeader?: boolean;
}

const alignClasses = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

export function DataTable<TData>({
  actions,
  columns,
  data,
  emptyState,
  error,
  getRowId,
  isLoading = false,
  onRowClick,
  stickyHeader = true,
  zebraRows = false,
}: DataTableProps<TData>) {
  if (error) {
    return <ErrorState title="Unable to load data" description={error} />;
  }

  if (isLoading) {
    return (
      <div className="grid gap-2 rounded-xl border border-border bg-surface p-4 shadow-soft">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} variant="table-row" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return emptyState ?? <EmptyTable />;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-soft">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className={cn('bg-background', stickyHeader && 'sticky top-0 z-10')}>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.id}
                  scope="col"
                  className={cn(
                    'px-5 py-4 font-semibold text-muted',
                    alignClasses[column.align ?? 'left'],
                    column.className,
                  )}
                >
                  {column.header}
                </th>
              ))}
              {actions ? (
                <th className="px-5 py-4 text-right font-semibold text-muted">Actions</th>
              ) : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((row, index) => (
              <tr
                key={getRowId(row, index)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  'transition hover:bg-accent/45',
                  zebraRows && index % 2 === 1 && 'bg-background/60',
                  onRowClick && 'cursor-pointer',
                )}
              >
                {columns.map((column) => (
                  <td
                    key={column.id}
                    className={cn(
                      'px-5 py-4 text-text',
                      alignClasses[column.align ?? 'left'],
                      column.className,
                    )}
                  >
                    {column.cell
                      ? column.cell(row)
                      : column.accessor
                        ? String(row[column.accessor] ?? '')
                        : null}
                  </td>
                ))}
                {actions ? (
                  <td className="px-5 py-4 text-right">{actions(row)}</td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
