import { X } from 'lucide-react';
import { useEffect, useId, useRef, type KeyboardEvent, type ReactNode } from 'react';

import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

export type ModalWidth = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  subtitle?: string;
  header?: ReactNode;
  footer?: ReactNode;
  width?: ModalWidth;
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
  isDestructive?: boolean;
  ariaLabel?: string;
}

const widthClasses: Record<ModalWidth, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'h-[calc(100vh-2rem)] max-w-[calc(100vw-2rem)]',
};

const focusableSelector =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Modal({
  ariaLabel,
  children,
  closeOnOverlayClick = true,
  footer,
  header,
  isDestructive = false,
  isOpen,
  onClose,
  showCloseButton = true,
  subtitle,
  title,
  width = 'md',
}: ModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    previousFocusRef.current = document.activeElement as HTMLElement;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();

    return () => {
      document.body.style.overflow = '';
      previousFocusRef.current?.focus();
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      onClose();
      return;
    }

    if (event.key !== 'Tab' || !panelRef.current) {
      return;
    }

    const focusable = Array.from(
      panelRef.current.querySelectorAll<HTMLElement>(focusableSelector),
    );

    if (focusable.length === 0) {
      event.preventDefault();
      return;
    }

    const firstElement = focusable[0];
    const lastElement = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    }

    if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
      onKeyDown={handleKeyDown}
    >
      <button
        type="button"
        className="absolute inset-0 bg-text/35 backdrop-blur-sm transition-opacity"
        aria-label="Close modal"
        onClick={closeOnOverlayClick ? onClose : undefined}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        className={cn(
          'relative flex max-h-[calc(100vh-2rem)] w-full flex-col overflow-hidden rounded-xl border bg-surface shadow-soft outline-none transition duration-300',
          isDestructive ? 'border-primary-dark' : 'border-border',
          widthClasses[width],
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div className="min-w-0">
            {header ?? (
              <>
                {title ? (
                  <h2
                    id={titleId}
                    className="font-heading text-xl font-semibold text-text"
                  >
                    {title}
                  </h2>
                ) : null}
                {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
              </>
            )}
          </div>
          {showCloseButton ? (
            <Button variant="ghost" size="sm" aria-label="Close modal" onClick={onClose}>
              <X aria-hidden="true" className="size-5" />
            </Button>
          ) : null}
        </div>
        <div className="overflow-y-auto p-5">{children}</div>
        {footer ? <div className="border-t border-border p-5">{footer}</div> : null}
      </div>
    </div>
  );
}
