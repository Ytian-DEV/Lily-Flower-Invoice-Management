import { Button } from '@/components/ui';

export interface FormFooterProps {
  saveLabel?: string;
  cancelLabel?: string;
  deleteLabel?: string;
  isLoading?: boolean;
  isDisabled?: boolean;
  onSave?: () => void;
  onCancel?: () => void;
  onDelete?: () => void;
}

export function FormFooter({
  cancelLabel = 'Cancel',
  deleteLabel = 'Delete',
  isDisabled = false,
  isLoading = false,
  onCancel,
  onDelete,
  onSave,
  saveLabel = 'Save',
}: FormFooterProps) {
  return (
    <div className="sticky bottom-0 z-10 flex flex-col-reverse gap-3 border-t border-border bg-background/95 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
      <div>
        {onDelete ? (
          <Button variant="danger" disabled={isDisabled || isLoading} onClick={onDelete}>
            {deleteLabel}
          </Button>
        ) : null}
      </div>
      <div className="flex flex-col-reverse gap-3 sm:flex-row">
        <Button variant="outline" disabled={isLoading} onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button isLoading={isLoading} disabled={isDisabled} onClick={onSave}>
          {saveLabel}
        </Button>
      </div>
    </div>
  );
}
