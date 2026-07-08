import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';

export interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  progressText?: string;
  blurBackground?: boolean;
}

export function LoadingOverlay({
  blurBackground = true,
  isVisible,
  message = 'Loading...',
  progressText,
}: LoadingOverlayProps) {
  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-6',
        blurBackground && 'backdrop-blur-sm',
      )}
      role="status"
      aria-live="polite"
    >
      <div className="rounded-xl border border-border bg-surface p-6 text-center shadow-soft">
        <Spinner size="lg" className="text-primary" />
        <p className="mt-4 font-semibold text-text">{message}</p>
        {progressText ? <p className="mt-1 text-sm text-muted">{progressText}</p> : null}
      </div>
    </div>
  );
}
