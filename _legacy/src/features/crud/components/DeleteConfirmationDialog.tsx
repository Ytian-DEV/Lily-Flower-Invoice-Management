import { ConfirmationDialog } from '@/components/ui';

export interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  entityLabel: string;
  isLoading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmationDialog({
  entityLabel,
  isLoading,
  isOpen,
  onCancel,
  onConfirm,
}: DeleteConfirmationDialogProps) {
  return (
    <ConfirmationDialog
      isOpen={isOpen}
      onCancel={onCancel}
      onConfirm={onConfirm}
      title={`Delete ${entityLabel}?`}
      description="This action cannot be undone."
      confirmLabel="Delete"
      isDanger
      isLoading={isLoading}
    />
  );
}
