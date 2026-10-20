import type { KeyboardEvent, ReactNode } from 'react';

import { Skeleton } from '@/components/ui/Feedback';
import { cn } from '@/utils/cn';

export interface DataTableColumn<TRow> {
  id: string;
  header: ReactNode;
  cell: (row: TRow) => ReactNode;
  align?: 'left' | 'right';
  className?: string;
  /** Hide on small screens to keep the table readable on phones. */
  hideBelow?: 'sm' | 'md' | 'lg';
}

export interface DataTableProps<TRow> {
  columns: DataTableColumn<TRow>[];
  rows: TRow[];
  getRowId: (row: TRow) => string;
  isLoading?: boolean;
  skeletonRows?: number;
  empty?: ReactNode;
  onRowClick?: (row: TRow) => void;
  rowLabel?: (row: TRow) => string;
  actions?: (row: TRow) => ReactNode;
  footer?: ReactNode;
  /** Compact card shown instead of the table on phones. */
  renderMobileRow?: (row: TRow) => ReactNode;
}

const hideClasses = {
  sm: 'hidden sm:table-cell',
  md: 'hidden md:table-cell',
  lg: 'hidden lg:table-cell',
};

export function DataTable<TRow>({
  actions,
  columns,
  empty,
  footer,
  getRowId,
  isLoading = false,
  onRowClick,
  rowLabel,
  renderMobileRow,
  rows,
  skeletonRows = 6,
}: DataTableProps<TRow>) {
  const cellClass = (column: DataTableColumn<TRow>) =>
    cn(
      'px-4 py-3 first:pl-5 last:pr-5',
      column.align === 'right' ? 'text-right' : 'text-left',
      column.hideBelow && hideClasses[column.hideBelow],
      column.className,
    );

  const handleRowKeyDown = (event: KeyboardEvent<HTMLTableRowElement>, row: TRow) => {
    if (onRowClick && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onRowClick(row);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-card">
      {renderMobileRow ? (
        <ul className="divide-y divide-border sm:hidden">
          {isLoading
            ? Array.from({ length: Math.min(skeletonRows, 5) }, (_, index) => (
                <li key={index} className="px-4 py-3">
                  <Skeleton className="h-10" />
                </li>
              ))
            : rows.map((row) => (
                <li key={getRowId(row)}>
                  {onRowClick ? (
                    <button
                      type="button"
                      onClick={() => onRowClick(row)}
                      className="block w-full px-4 py-3 text-left text-sm transition-colors active:bg-surface-muted"
                    >
                      {renderMobileRow(row)}
                    </button>
                  ) : (
                    <div className="px-4 py-3 text-sm">{renderMobileRow(row)}</div>
                  )}
                </li>
              ))}
        </ul>
      ) : null}
      <div className={cn('overflow-x-auto', renderMobileRow && 'hidden sm:block')}>
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-surface-muted">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.id}
                  scope="col"
                  className={cn(
                    cellClass(column),
                    'py-2.5 text-xs font-medium tracking-wide text-muted',
                  )}
                >
                  {column.header}
                </th>
              ))}
              {actions ? (
                <th scope="col" className="w-12 pr-5">
                  <span className="sr-only">Actions</span>
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading
              ? Array.from({ length: skeletonRows }, (_, index) => (
                  <tr key={index}>
                    {columns.map((column) => (
                      <td key={column.id} className={cellClass(column)}>
                        <Skeleton className="h-4 w-full max-w-32" />
                      </td>
                    ))}
                    {actions ? <td /> : null}
                  </tr>
                ))
              : rows.map((row) => (
                  <tr
                    key={getRowId(row)}
                    tabIndex={onRowClick ? 0 : undefined}
                    aria-label={onRowClick && rowLabel ? rowLabel(row) : undefined}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    onKeyDown={(event) => handleRowKeyDown(event, row)}
                    className={cn(
                      'transition-colors',
                      onRowClick &&
                        'cursor-pointer hover:bg-surface-muted focus-visible:bg-surface-muted focus-visible:outline-none',
                    )}
                  >
                    {columns.map((column) => (
                      <td key={column.id} className={cn(cellClass(column), 'text-text')}>
                        {column.cell(row)}
                      </td>
                    ))}
                    {actions ? (
                      <td
                        className="pr-3 text-right"
                        onClick={(event) => event.stopPropagation()}
                        onKeyDown={(event) => event.stopPropagation()}
                      >
                        {actions(row)}
                      </td>
                    ) : null}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
      {!isLoading && rows.length === 0 ? empty : null}
      {footer}
    </div>
  );
}
