import { Bell, Menu, Moon, UserCircle } from 'lucide-react';

import { LogoPlaceholder } from '@/components/layout/LogoPlaceholder';

interface TopNavigationProps {
  onMenuClick: () => void;
}

export function TopNavigation({ onMenuClick }: TopNavigationProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/95 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex min-h-14 items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-xl border border-border text-muted transition hover:bg-accent hover:text-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary lg:hidden"
            aria-label="Open navigation menu"
            onClick={onMenuClick}
          >
            <Menu aria-hidden="true" className="size-5" />
          </button>
          <div className="hidden sm:block">
            <LogoPlaceholder size="sm" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-heading text-base font-semibold sm:text-lg">
              Lily Flowers - Baybay City Branch
            </p>
            <p className="text-sm text-muted">Internal management system</p>
          </div>
        </div>
        <div className="flex items-center gap-2" aria-label="Reserved toolbar">
          {[Bell, Moon, UserCircle].map((Icon, index) => (
            <button
              key={Icon.displayName ?? index}
              type="button"
              className="inline-flex size-11 items-center justify-center rounded-xl border border-border text-muted transition hover:bg-accent hover:text-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              aria-label="Reserved action"
            >
              <Icon aria-hidden="true" className="size-5" />
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
