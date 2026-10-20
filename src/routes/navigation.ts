import {
  ClipboardList,
  Flower2,
  LayoutDashboard,
  Settings,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

export interface NavigationItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

export const navigationItems: NavigationItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Orders', path: '/orders', icon: ClipboardList },
  { label: 'Payments', path: '/payments', icon: Wallet },
  { label: 'Customers', path: '/customers', icon: Users },
  { label: 'Catalog', path: '/catalog', icon: Flower2 },
  { label: 'Settings', path: '/settings', icon: Settings },
];
