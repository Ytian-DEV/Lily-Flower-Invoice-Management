import {
  CreditCard,
  FileClock,
  FilePlus2,
  LayoutDashboard,
  Package,
  Settings,
  Users,
  type LucideIcon,
} from 'lucide-react';

export interface NavigationItem {
  label: string;
  path: string;
  icon: LucideIcon;
  end?: boolean;
}

export const navigationItems: NavigationItem[] = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard, end: true },
  { label: 'New Invoice', path: '/invoices/new', icon: FilePlus2 },
  { label: 'Invoice History', path: '/invoices/history', icon: FileClock },
  { label: 'Customers', path: '/customers', icon: Users },
  { label: 'Products', path: '/products', icon: Package },
  { label: 'Payments', path: '/payments', icon: CreditCard },
  { label: 'Settings', path: '/settings', icon: Settings },
];
