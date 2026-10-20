import type { ReactNode } from 'react';
import { Plus } from 'lucide-react';

import { Button, TableToolbar } from '@/components/ui';

export interface CrudToolbarProps {
  searchValue?: string;
  searchPlaceholder?: string;
  filters?: ReactNode;
  actions?: ReactNode;
  createLabel?: string;
  bulkActions?: ReactNode;
  onCreate?: () => void;
  onRefresh?: () => void;
  onExport?: () => void;
  onSearchChange?: (value: string) => void;
}

export function CrudToolbar({
  actions,
  bulkActions,
  createLabel = 'Create',
  filters,
  onCreate,
  onExport,
  onRefresh,
  onSearchChange,
  searchPlaceholder,
  searchValue,
}: CrudToolbarProps) {
  return (
    <TableToolbar
      searchValue={searchValue}
      searchPlaceholder={searchPlaceholder}
      filters={filters}
      onSearchChange={onSearchChange}
      onRefresh={onRefresh}
      onExport={onExport}
      actions={
        <>
          {bulkActions}
          {actions}
          {onCreate ? (
            <Button
              leftIcon={<Plus aria-hidden="true" className="size-4" />}
              onClick={onCreate}
            >
              {createLabel}
            </Button>
          ) : null}
        </>
      }
    />
  );
}
