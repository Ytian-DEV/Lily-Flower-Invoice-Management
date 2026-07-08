import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router';

import { LoadingPage } from '@/pages/LoadingPage';
import { AppLayout } from '@/layouts/AppLayout';

const PlaceholderPage = lazy(() =>
  import('@/pages/PlaceholderPage').then((module) => ({
    default: module.PlaceholderPage,
  })),
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
      { index: true, element: withSuspense(<PlaceholderPage title="Home" />) },
      {
        path: 'dashboard',
        element: withSuspense(<PlaceholderPage title="Dashboard" />),
      },
      {
        path: 'invoices',
        element: withSuspense(<PlaceholderPage title="Invoices" />),
      },
      {
        path: 'customers',
        element: withSuspense(<PlaceholderPage title="Customers" />),
      },
      {
        path: 'products',
        element: withSuspense(<PlaceholderPage title="Products" />),
      },
      {
        path: 'payments',
        element: withSuspense(<PlaceholderPage title="Payments" />),
      },
      {
        path: 'settings',
        element: withSuspense(<PlaceholderPage title="Settings" />),
      },
      {
        path: 'preview',
        element: withSuspense(<PlaceholderPage title="Invoice Preview" />),
      },
      { path: '*', element: withSuspense(<NotFoundPage />) },
    ],
  },
]);
