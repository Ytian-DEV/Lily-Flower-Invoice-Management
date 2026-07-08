import { Bell, LogOut, Menu, Moon, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router';

import { LogoPlaceholder } from '@/components/layout/LogoPlaceholder';
import { Button } from '@/components/ui';
import { useAuth } from '@/features/auth';

interface TopNavigationProps {
  onMenuClick: () => void;
}

export function TopNavigation({ onMenuClick }: TopNavigationProps) {
  const navigate = useNavigate();
  const { logout, profile } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

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
        <div className="flex items-center gap-2" aria-label="User toolbar">
          {[Bell, Moon].map((Icon, index) => (
            <button
              key={Icon.displayName ?? index}
              type="button"
              className="inline-flex size-11 items-center justify-center rounded-xl border border-border text-muted transition hover:bg-accent hover:text-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              aria-label="Reserved action"
            >
              <Icon aria-hidden="true" className="size-5" />
            </button>
          ))}
          <div className="hidden min-w-0 items-center gap-3 rounded-xl border border-border px-3 py-2 sm:flex">
            <UserCircle aria-hidden="true" className="size-5 shrink-0 text-primary" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-text">
                {profile?.full_name ?? 'Authenticated User'}
              </p>
              <p className="text-xs capitalize text-muted">{profile?.role ?? 'staff'}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<LogOut aria-hidden="true" className="size-4" />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
