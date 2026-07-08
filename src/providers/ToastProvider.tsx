import type { PropsWithChildren } from 'react';

import { ToastProvider as UiToastProvider } from '@/components/ui';

export function ToastProvider({ children }: PropsWithChildren) {
  return <UiToastProvider>{children}</UiToastProvider>;
}
