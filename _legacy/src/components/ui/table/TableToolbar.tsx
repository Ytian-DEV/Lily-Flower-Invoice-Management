import type { ReactNode } from 'react';
import { Download, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { SearchBar } from '@/components/ui/search/SearchBar';

export interface TableToolbarProps {
  searchValue?: string;
  searchPlaceholder?: string;
  filters?: ReactNode;
  actions?: ReactNode;
  onSearchChange?: (value: string) => void;
  onRefresh?: () => void;
  onExport?: () => void;
}

export function TableToolbar({
  actions,
  filters,
  onExport,
  onRefresh,
  onSearchChange,
  searchPlaceholder,
  searchValue,
}: TableToolbarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 shadow-soft lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row">
        <SearchBar
          value={searchValue}
          placeholder={searchPlaceholder}
          onChange={onSearchChange}
        />
        {filters}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          leftIcon={<RefreshCw aria-hidden="true" className="size-4" />}
          onClick={onRefresh}
        >
          Refresh
        </Button>
        <Button
          variant="outline"
          leftIcon={<Download aria-hidden="true" className="size-4" />}
          onClick={onExport}
        >
          Export
        </Button>
        {actions}
      </div>
    </div>
  );
}
