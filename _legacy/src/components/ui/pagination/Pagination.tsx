import { ChevronsLeft, ChevronsRight, ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';

export interface PaginationProps {
  page: number;
  pageCount: number;
  pageSize: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

export function Pagination({
  onPageChange,
  onPageSizeChange,
  page,
  pageCount,
  pageSize,
  pageSizeOptions = [10, 25, 50],
}: PaginationProps) {
  const canGoBack = page > 1;
  const canGoForward = page < pageCount;
  const pages = Array.from({ length: Math.min(pageCount, 5) }, (_, index) => {
    const start = Math.max(1, Math.min(page - 2, pageCount - 4));
    return start + index;
  });

  return (
    <nav
      className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
      aria-label="Pagination"
    >
      <p className="text-sm text-muted">
        Page {page} of {pageCount}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {onPageSizeChange ? (
          <Select
            aria-label="Rows per page"
            value={String(pageSize)}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            options={pageSizeOptions.map((option) => ({
              label: `${option} rows`,
              value: String(option),
            }))}
          />
        ) : null}
        <Button
          variant="outline"
          size="sm"
          disabled={!canGoBack}
          onClick={() => onPageChange(1)}
          aria-label="First page"
        >
          <ChevronsLeft aria-hidden="true" className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={!canGoBack}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft aria-hidden="true" className="size-4" />
        </Button>
        <div className="hidden gap-2 sm:flex">
          {pages.map((pageNumber) => (
            <Button
              key={pageNumber}
              variant={pageNumber === page ? 'primary' : 'outline'}
              size="sm"
              onClick={() => onPageChange(pageNumber)}
            >
              {pageNumber}
            </Button>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={!canGoForward}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          <ChevronRight aria-hidden="true" className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={!canGoForward}
          onClick={() => onPageChange(pageCount)}
          aria-label="Last page"
        >
          <ChevronsRight aria-hidden="true" className="size-4" />
        </Button>
      </div>
    </nav>
  );
}
