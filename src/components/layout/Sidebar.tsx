import { LogOut, Plus } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router';

import { BrandMark } from '@/components/layout/BrandMark';
import { ButtonLink, focusRing } from '@/components/ui';
import { useAuth } from '@/features/auth';
import { navigationItems } from '@/routes/navigation';
import { cn } from '@/utils/cn';

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate();
  const { logout, profile, user } = useAuth();
  const displayName = profile?.full_name ?? user?.email ?? 'Signed in';
  const initials = displayName
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex h-full flex-col">
      <div className="px-4 pt-5 pb-4">
        <BrandMark />
      </div>

      <div className="px-3">
        <ButtonLink
          to="/orders/new"
          onClick={onNavigate}
          fullWidth
          leftIcon={<Plus aria-hidden="true" className="size-4" />}
        >
          New order
        </ButtonLink>
      </div>

      <nav aria-label="Main" className="mt-4 grid gap-0.5 px-3">
        {navigationItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-sm font-medium transition-colors',
                focusRing,
                isActive
                  ? 'bg-primary-soft text-primary-dark'
                  : 'text-muted hover:bg-black/[0.04] hover:text-text',
              )
            }
          >
            <item.icon aria-hidden="true" className="size-4 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto border-t border-border p-3">
        <div className="flex items-center gap-2.5 rounded-lg px-1.5 py-1.5">
          <span
            aria-hidden="true"
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-primary-dark"
          >
            {initials || 'LF'}
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-medium text-text">{displayName}</p>
            <p className="text-xs text-muted capitalize">{profile?.role ?? 'Staff'}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Sign out"
            title="Sign out"
            className={cn(
              'rounded-md p-1.5 text-subtle transition-colors hover:bg-black/[0.04] hover:text-text',
              focusRing,
            )}
          >
            <LogOut aria-hidden="true" className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r border-border bg-surface lg:block">
      <SidebarContent />
    </aside>
  );
}
