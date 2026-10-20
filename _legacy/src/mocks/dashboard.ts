import {
  CalendarDays,
  CreditCard,
  FileClock,
  FilePlus2,
  Package,
  Settings,
  Users,
} from 'lucide-react';

import type { StatusChipStatus } from '@/components/ui';

export const dashboardQuickActions = [
  { label: 'Generate Invoice', path: '/invoices/new', icon: FilePlus2 },
  { label: 'Manage Products', path: '/products', icon: Package },
  { label: 'Manage Customers', path: '/customers', icon: Users },
  { label: 'Invoice History', path: '/history', icon: FileClock },
  { label: 'Settings', path: '/settings', icon: Settings },
];

export const dashboardStats = [
  {
    title: "Today's Orders",
    value: '0',
    icon: CalendarDays,
    description: 'Ready for live data',
  },
  {
    title: 'Pending Payments',
    value: '0',
    icon: CreditCard,
    description: 'Ready for live data',
  },
  {
    title: 'Completed Orders',
    value: '0',
    icon: FileClock,
    description: 'Ready for live data',
  },
  {
    title: 'Revenue Today',
    value: 'PHP 0.00',
    icon: CreditCard,
    description: 'Ready for live data',
  },
  {
    title: 'Outstanding Balance',
    value: 'PHP 0.00',
    icon: CreditCard,
    description: 'Ready for live data',
  },
  { title: 'Products', value: '0', icon: Package, description: 'Ready for live data' },
  { title: 'Customers', value: '0', icon: Users, description: 'Ready for live data' },
  { title: 'Invoices', value: '0', icon: FileClock, description: 'Ready for live data' },
];

export interface DashboardActivityItem {
  id: string;
  title: string;
  description: string;
  date: string;
}

export const recentActivity: DashboardActivityItem[] = [
  {
    id: 'activity-setup',
    title: 'Dashboard framework ready',
    description: 'Recent activity will connect to invoice and payment events later.',
    date: 'Today',
  },
];

export interface DashboardInvoiceRow {
  id: string;
  invoiceNumber: string;
  customer: string;
  status: StatusChipStatus;
  balance: string;
  date: string;
}

export const recentInvoices: DashboardInvoiceRow[] = [
  {
    id: 'invoice-placeholder',
    invoiceNumber: 'Pending live data',
    customer: 'No customer selected',
    status: 'pending',
    balance: 'PHP 0.00',
    date: 'Not scheduled',
  },
];

export const pendingPayments = [
  { id: 'payment-placeholder', label: 'No pending payments yet', value: 'PHP 0.00' },
];

export const upcomingDeliveries = [
  {
    id: 'delivery-placeholder',
    label: 'No upcoming deliveries yet',
    value: 'Not scheduled',
  },
];

export const systemOverview = [
  { label: 'Storage', value: 'Ready' },
  { label: 'Users', value: 'Supabase Auth' },
  { label: 'Invoices', value: 'Framework ready' },
  { label: 'Payments', value: 'Framework ready' },
];
