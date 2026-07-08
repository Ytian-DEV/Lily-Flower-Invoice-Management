import { z } from 'zod';

export const invoiceStatusSchema = z.enum([
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'out_for_delivery',
  'completed',
  'cancelled',
]);

export const paymentStatusSchema = z.enum(['pending', 'partially_paid', 'paid']);
export const productAvailabilitySchema = z.enum(['available', 'unavailable']);
export const paymentMethodSchema = z.enum(['cash', 'gcash', 'bank_transfer', 'maribank']);
