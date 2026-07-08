import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router';

import { AppLayout } from '@/layouts/AppLayout';
import { LoadingPage } from '@/pages/LoadingPage';

const DashboardPage = lazy(() =>
  import('@/pages/DashboardPage').then((module) => ({ default: module.DashboardPage })),
);
const NewInvoicePage = lazy(() =>
  import('@/pages/NewInvoicePage').then((module) => ({ default: module.NewInvoicePage })),
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
    path: '/',
    element: <AppLayout />,
    errorElement: withSuspense(<ErrorPage />),
    children: [
      { index: true, element: withSuspense(<DashboardPage />) },
      {
        path: 'invoices/new',
        element: withSuspense(<NewInvoicePage />),
      },
      {
        path: 'invoices/history',
        element: withSuspense(<InvoiceHistoryPage />),
      },
      {
        path: 'customers',
        element: withSuspense(<CustomersPage />),
      },
      {
        path: 'products',
        element: withSuspense(<ProductsPage />),
      },
      {
        path: 'payments',
        element: withSuspense(<PaymentsPage />),
      },
      {
        path: 'settings',
        element: withSuspense(<SettingsPage />),
      },
      { path: '*', element: withSuspense(<NotFoundPage />) },
    ],
  },
]);
