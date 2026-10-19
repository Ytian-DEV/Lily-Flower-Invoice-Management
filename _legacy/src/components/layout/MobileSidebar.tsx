import { X } from 'lucide-react';

import { LogoPlaceholder } from '@/components/layout/LogoPlaceholder';
import { SidebarItem } from '@/components/layout/SidebarItem';
import { navigationItems } from '@/routes/navigation';
import { cn } from '@/utils/cn';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  return (
    <div
      className={cn(
        'fixed inset-0 z-40 lg:hidden',
        isOpen ? 'pointer-events-auto' : 'pointer-events-none',
      )}
      aria-hidden={!isOpen}
    >
      <button
        type="button"
        className={cn(
          'absolute inset-0 bg-text/30 transition-opacity',
          isOpen ? 'opacity-100' : 'opacity-0',
        )}
        aria-label="Close navigation menu"
        onClick={onClose}
      />
      <aside
        className={cn(
          'relative flex h-full w-80 max-w-[86vw] flex-col border-r border-border bg-surface shadow-soft transition-transform',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
        aria-label="Mobile navigation"
      >
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <LogoPlaceholder />
            <div className="min-w-0">
              <p className="truncate font-heading text-base font-semibold">
                Lily Flowers
              </p>
              <p className="text-sm text-muted">Baybay City Branch</p>
            </div>
          </div>
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-xl border border-border text-muted transition hover:bg-accent hover:text-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            aria-label="Close navigation menu"
            onClick={onClose}
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>
        <nav
          aria-label="Mobile main navigation"
          className="grid gap-2 overflow-y-auto p-4"
        >
          {navigationItems.map((item) => (
            <SidebarItem key={item.path} item={item} onNavigate={onClose} />
          ))}
        </nav>
      </aside>
    </div>
  );
}
