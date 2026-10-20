import type { ReactNode } from 'react';
import { Archive, Copy, Edit, Eye, MoreHorizontal, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui';

export interface ActionMenuItem {
  label: string;
  icon?: ReactNode;
  isDanger?: boolean;
  onClick: () => void;
}

export interface ActionMenuProps {
  onView?: () => void;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  customActions?: ActionMenuItem[];
}

export function ActionMenu({
  customActions = [],
  onArchive,
  onDelete,
  onDuplicate,
  onEdit,
  onView,
}: ActionMenuProps) {
  const actions: ActionMenuItem[] = [
    onView ? { label: 'View', icon: <Eye className="size-4" />, onClick: onView } : null,
    onEdit ? { label: 'Edit', icon: <Edit className="size-4" />, onClick: onEdit } : null,
    onDuplicate
      ? { label: 'Duplicate', icon: <Copy className="size-4" />, onClick: onDuplicate }
      : null,
    onArchive
      ? { label: 'Archive', icon: <Archive className="size-4" />, onClick: onArchive }
      : null,
    ...customActions,
    onDelete
      ? {
          label: 'Delete',
          icon: <Trash2 className="size-4" />,
          isDanger: true,
          onClick: onDelete,
        }
      : null,
  ].filter((item): item is ActionMenuItem => Boolean(item));

  return (
    <div className="group relative inline-flex">
      <Button variant="ghost" size="sm" aria-label="Open action menu">
        <MoreHorizontal aria-hidden="true" className="size-5" />
      </Button>
      <div className="invisible absolute right-0 top-11 z-20 min-w-40 rounded-xl border border-border bg-surface p-2 opacity-0 shadow-soft transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            className="flex min-h-10 w-full items-center gap-2 rounded-lg px-3 text-left text-sm text-muted transition hover:bg-accent hover:text-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary data-[danger=true]:text-danger-text"
            data-danger={action.isDanger || undefined}
            onClick={action.onClick}
          >
            {action.icon}
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}
