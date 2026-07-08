import {
  CreditCard,
  FileText,
  Home,
  LayoutDashboard,
  Package,
  Settings,
  Users,
} from 'lucide-react';
import { NavLink } from 'react-router';

import { LogoPlaceholder } from '@/components/shared/LogoPlaceholder';
import { cn } from '@/utils/cn';

const navItems = [
  { label: 'Home', path: '/', icon: Home },
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Invoices', path: '/invoices', icon: FileText },
  { label: 'Customers', path: '/customers', icon: Users },
  { label: 'Products', path: '/products', icon: Package },
  { label: 'Payments', path: '/payments', icon: CreditCard },
  { label: 'Settings', path: '/settings', icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="border-border bg-surface/95 lg:border-r">
      <div className="flex items-center gap-3 border-b border-border px-5 py-4">
        <LogoPlaceholder />
        <div>
          <p className="font-heading text-base font-semibold">Lily Flowers</p>
          <p className="text-sm text-muted">Baybay City Branch</p>
        </div>
      </div>
      <nav
        aria-label="Main navigation"
        className="flex gap-2 overflow-x-auto p-4 lg:block"
      >
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'mb-1 flex min-h-12 items-center gap-3 rounded-xl px-4 text-sm font-medium text-muted transition hover:bg-accent hover:text-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
                isActive && 'bg-accent text-primary-dark',
              )
            }
          >
            <item.icon aria-hidden="true" className="size-5 shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
