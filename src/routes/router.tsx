import { lazy, Suspense, type ComponentType, type ReactNode } from 'react';
import { createBrowserRouter, Navigate } from 'react-router';

import { AppShell } from '@/components/layout/AppShell';
import { LoadingScreen } from '@/components/ui';
import { ProtectedRoute } from '@/features/auth';
import { ErrorPage } from '@/pages/ErrorPage';
import { RedirectWithId } from '@/routes/RedirectWithId';

/** Route-level code splitting: each page is its own chunk, loaded on first visit. */
function page<TModule extends Record<string, unknown>>(
  load: () => Promise<TModule>,
  exportName: keyof TModule,
) {
  return lazy(async () => ({
    default: (await load())[exportName] as ComponentType,
  }));
}

const LoginPage = page(() => import('@/features/auth/pages/LoginPage'), 'LoginPage');
const DashboardPage = page(() => import('@/pages/DashboardPage'), 'DashboardPage');
const OrdersPage = page(() => import('@/pages/OrdersPage'), 'OrdersPage');
const OrderFormPage = page(() => import('@/pages/OrderFormPage'), 'OrderFormPage');
const OrderDetailPage = page(() => import('@/pages/OrderDetailPage'), 'OrderDetailPage');
const InvoicePage = page(() => import('@/pages/InvoicePage'), 'InvoicePage');
const PaymentsPage = page(() => import('@/pages/PaymentsPage'), 'PaymentsPage');
const CustomersPage = page(() => import('@/pages/CustomersPage'), 'CustomersPage');
const CatalogPage = page(() => import('@/pages/CatalogPage'), 'CatalogPage');
const SettingsPage = page(() => import('@/pages/SettingsPage'), 'SettingsPage');
const NotFoundPage = page(() => import('@/pages/NotFoundPage'), 'NotFoundPage');

const withSuspense = (element: ReactNode) => (
  <Suspense fallback={<LoadingScreen />}>{element}</Suspense>
);

export const router = createBrowserRouter([
  { path: '/login', element: withSuspense(<LoginPage />) },
  {
    element: <ProtectedRoute />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: '/',
        element: <AppShell />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: 'dashboard', element: withSuspense(<DashboardPage />) },
          { path: 'orders', element: withSuspense(<OrdersPage />) },
          { path: 'orders/new', element: withSuspense(<OrderFormPage />) },
          { path: 'orders/:id', element: withSuspense(<OrderDetailPage />) },
          { path: 'orders/:id/edit', element: withSuspense(<OrderFormPage />) },
          { path: 'orders/:id/invoice', element: withSuspense(<InvoicePage />) },
          { path: 'payments', element: withSuspense(<PaymentsPage />) },
          { path: 'customers', element: withSuspense(<CustomersPage />) },
          { path: 'catalog', element: withSuspense(<CatalogPage />) },
          { path: 'settings', element: withSuspense(<SettingsPage />) },

          {
            path: 'orders/:id/preview',
            element: <RedirectWithId to={(id) => `/orders/${id}/invoice`} />,
          },
          {
            path: 'payments/:id',
            element: <RedirectWithId to={(id) => `/orders/${id}`} />,
          },
          { path: 'history', element: <Navigate to="/orders" replace /> },
          { path: 'invoices', element: <Navigate to="/orders" replace /> },
          { path: 'invoices/new', element: <Navigate to="/orders/new" replace /> },
          { path: 'invoices/history', element: <Navigate to="/orders" replace /> },
          { path: 'products', element: <Navigate to="/catalog" replace /> },

          { path: '*', element: withSuspense(<NotFoundPage />) },
        ],
      },
    ],
  },
]);
