import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Outlet, useLocation } from 'react-router';

import { BrandMark } from '@/components/layout/BrandMark';
import { Sidebar, SidebarContent } from '@/components/layout/Sidebar';
import { Button } from '@/components/ui';
import { prefetchCommonPages } from '@/routes/prefetch';
import { cn } from '@/utils/cn';

export function AppShell() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    prefetchCommonPages();
  }, []);

  return (
    <div className="min-h-screen bg-background text-text">
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-surface px-3 py-2 text-sm shadow-popover focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>

      <Sidebar />

      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-surface/95 px-4 backdrop-blur lg:hidden print:hidden">
        <BrandMark />
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open menu"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen(true)}
        >
          <Menu aria-hidden="true" className="size-5" />
        </Button>
      </header>

      <div
        className={cn(
          'fixed inset-0 z-40 lg:hidden',
          !isMenuOpen && 'pointer-events-none',
        )}
        inert={!isMenuOpen}
      >
        <div
          aria-hidden="true"
          onClick={() => setIsMenuOpen(false)}
          className={cn(
            'absolute inset-0 bg-[#221b1e]/40 transition-opacity',
            isMenuOpen ? 'opacity-100' : 'opacity-0',
          )}
        />
        <aside
          aria-label="Menu"
          className={cn(
            'relative h-full w-72 max-w-[85vw] bg-surface shadow-popover transition-transform duration-200',
            isMenuOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <Button
            variant="ghost"
            size="icon"
            aria-label="Close menu"
            className="absolute top-4 right-3"
            onClick={() => setIsMenuOpen(false)}
          >
            <X aria-hidden="true" className="size-4" />
          </Button>
          <SidebarContent onNavigate={() => setIsMenuOpen(false)} />
        </aside>
      </div>

      <main id="main" className="lg:pl-60">
        <Outlet />
      </main>
    </div>
  );
}
