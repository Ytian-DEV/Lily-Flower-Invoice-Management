import { RouterProvider } from 'react-router';

import { router } from '@/routes/router';

export function AppRouterProvider() {
  return <RouterProvider router={router} />;
}
