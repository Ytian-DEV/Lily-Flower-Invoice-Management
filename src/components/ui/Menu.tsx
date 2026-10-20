import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { MoreHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

export interface MenuItem {
  label: string;
  icon?: ReactNode;
  onSelect: () => void;
  isDanger?: boolean;
  hidden?: boolean;
}

/** Click-to-open action menu with keyboard support (replaces hover-only menus). */
export function Menu({
  items,
  label = 'More actions',
}: {
  items: MenuItem[];
  label?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const visibleItems = items.filter((item) => !item.hidden);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const close = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', close);
    containerRef.current?.querySelector<HTMLElement>('[role=menuitem]')?.focus();

    return () => document.removeEventListener('mousedown', close);
  }, [isOpen]);

  if (visibleItems.length === 0) {
    return null;
  }

  const moveFocus = (direction: 1 | -1) => {
    const entries = Array.from(
      containerRef.current?.querySelectorAll<HTMLElement>('[role=menuitem]') ?? [],
    );
    const index = entries.indexOf(document.activeElement as HTMLElement);
    entries[(index + direction + entries.length) % entries.length]?.focus();
  };

  return (
    <div
      ref={containerRef}
      className="relative inline-flex"
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          setIsOpen(false);
        } else if (isOpen && event.key === 'ArrowDown') {
          event.preventDefault();
          moveFocus(1);
        } else if (isOpen && event.key === 'ArrowUp') {
          event.preventDefault();
          moveFocus(-1);
        }
      }}
    >
      <Button
        variant="ghost"
        size="icon"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        onClick={() => setIsOpen((current) => !current)}
      >
        <MoreHorizontal aria-hidden="true" className="size-4" />
      </Button>
      {isOpen ? (
        <div
          id={menuId}
          role="menu"
          className="absolute top-full right-0 z-30 mt-1 min-w-44 animate-fade-in rounded-lg border border-border bg-surface p-1 shadow-popover"
        >
          {visibleItems.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              className={cn(
                'flex h-9 w-full items-center gap-2 rounded-md px-2.5 text-left text-sm text-text outline-none hover:bg-surface-muted focus-visible:bg-surface-muted [&_svg]:size-4 [&_svg]:text-subtle',
                item.isDanger && 'text-danger-text [&_svg]:text-danger',
              )}
              onClick={() => {
                setIsOpen(false);
                item.onSelect();
              }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
