import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/Button';

export interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ onPageChange, page, pageSize, total }: PaginationProps) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  if (total <= pageSize) {
    return null;
  }

  const first = (page - 1) * pageSize + 1;
  const last = Math.min(total, page * pageSize);

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-between gap-3 border-t border-border px-5 py-3 text-sm text-muted"
    >
      <p className="tabular-nums">
        {first}–{last} of {total}
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="secondary"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          leftIcon={<ChevronLeft aria-hidden="true" className="size-4" />}
        >
          Previous
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
          rightIcon={<ChevronRight aria-hidden="true" className="size-4" />}
        >
          Next
        </Button>
      </div>
    </nav>
  );
}
