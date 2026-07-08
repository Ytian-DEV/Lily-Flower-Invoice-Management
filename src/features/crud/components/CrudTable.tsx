import type { ReactNode } from 'react';

import { DataTable, Pagination, type DataTableColumn } from '@/components/ui';

export interface CrudTableProps<TData> {
  columns: DataTableColumn<TData>[];
  data: TData[];
  getRowId: (row: TData, index: number) => string;
  actions?: (row: TData) => ReactNode;
  isLoading?: boolean;
  error?: string;
  emptyState?: ReactNode;
  page?: number;
  pageCount?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

export function CrudTable<TData>({
  actions,
  columns,
  data,
  emptyState,
  error,
  getRowId,
  isLoading,
  onPageChange,
  onPageSizeChange,
  page,
  pageCount,
  pageSize,
}: CrudTableProps<TData>) {
  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={data}
        getRowId={getRowId}
        actions={actions}
        isLoading={isLoading}
        error={error}
        emptyState={emptyState}
      />
      {page && pageCount && pageSize && onPageChange ? (
        <Pagination
          page={page}
          pageCount={pageCount}
          pageSize={pageSize}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      ) : null}
    </div>
  );
}
