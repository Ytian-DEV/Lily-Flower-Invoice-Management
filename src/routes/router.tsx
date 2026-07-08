import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router';

import { ProtectedRoute } from '@/features/auth';
import { AppLayout } from '@/layouts/AppLayout';
import { LoadingPage } from '@/pages/LoadingPage';

const LoginPage = lazy(() =>
  import('@/features/auth/pages/LoginPage').then((module) => ({
    default: module.LoginPage,
  })),
);

const DashboardPage = lazy(() =>
  import('@/pages/DashboardPage').then((module) => ({ default: module.DashboardPage })),
);
const NewInvoicePage = lazy(() =>
  import('@/pages/NewInvoicePage').then((module) => ({ default: module.NewInvoicePage })),
);
const InvoicesPage = lazy(() =>
  import('@/pages/InvoicesPage').then((module) => ({ default: module.InvoicesPage })),
);
const InvoiceHistoryPage = lazy(() =>
  import('@/pages/InvoiceHistoryPage').then((module) => ({
    default: module.InvoiceHistoryPage,
  })),
);
const CustomersPage = lazy(() =>
  import('@/pages/CustomersPage').then((module) => ({ default: module.CustomersPage })),
);
const ProductsPage = lazy(() =>
  import('@/pages/ProductsPage').then((module) => ({ default: module.ProductsPage })),
);
const PaymentsPage = lazy(() =>
  import('@/pages/PaymentsPage').then((module) => ({ default: module.PaymentsPage })),
);
const SettingsPage = lazy(() =>
  import('@/pages/SettingsPage').then((module) => ({ default: module.SettingsPage })),
);
const NotFoundPage = lazy(() =>
  import('@/pages/NotFoundPage').then((module) => ({
    default: module.NotFoundPage,
  })),
);
const ErrorPage = lazy(() =>
  import('@/pages/ErrorPage').then((module) => ({
    default: module.ErrorPage,
  })),
);

const withSuspense = (element: React.ReactNode) => (
  <Suspense fallback={<LoadingPage />}>{element}</Suspense>
);

export const router = createBrowserRouter([
  {
    path: '/login',
    element: withSuspense(<LoginPage />),
  },
  {
    element: <ProtectedRoute />,
    errorElement: withSuspense(<ErrorPage />),
    children: [
      {
        path: '/',
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: 'dashboard', element: withSuspense(<DashboardPage />) },
          { path: 'invoices', element: withSuspense(<InvoicesPage />) },
          { path: 'invoices/new', element: withSuspense(<NewInvoicePage />) },
          { path: 'invoices/history', element: <Navigate to="/history" replace /> },
          { path: 'history', element: withSuspense(<InvoiceHistoryPage />) },
          { path: 'customers', element: withSuspense(<CustomersPage />) },
          { path: 'products', element: withSuspense(<ProductsPage />) },
          { path: 'payments', element: withSuspense(<PaymentsPage />) },
          { path: 'settings', element: withSuspense(<SettingsPage />) },
          { path: '*', element: withSuspense(<NotFoundPage />) },
        ],
      },
    ],
  },
]);
