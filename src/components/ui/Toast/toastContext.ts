import { createContext } from 'react';
import type { ReactNode } from 'react';

export type ToastVariant = 'success' | 'warning' | 'info' | 'error';
export type ToastPosition =
  | 'top-right'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-left'
  | 'top-center'
  | 'bottom-center';

export interface ToastOptions {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  action?: ReactNode;
}

export interface Toast extends Required<Omit<ToastOptions, 'action'>> {
  id: string;
  action?: ReactNode;
}

export interface ToastContextValue {
  toasts: Toast[];
  showToast: (options: ToastOptions) => string;
  dismissToast: (id: string) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);
