import { z } from 'zod';

import {
  invoiceStatusSchema,
  paymentMethodSchema,
  paymentStatusSchema,
} from '@/validation/enums';

const orderLineSchema = z.object({
  id: z.string().min(1),
  quantity: z.number().int().positive(),
  unitPrice: z.number().min(0),
  totalPrice: z.number().min(0),
});

export const orderFormSchema = z.object({
  customerId: z.string().uuid(),
  customerName: z.string().trim().min(1),
  phoneNumber: z.string().trim().min(7),
  deliveryAddress: z.string().trim().min(1),
  deliveryDate: z.string().min(1),
  products: z.array(orderLineSchema).min(1, 'Add at least one bouquet.'),
  addons: z.array(orderLineSchema).default([]),
  discountPercent: z.number().min(0).max(100),
  deliveryFee: z.number().min(0),
  downpaymentPercent: z.number().min(0).max(100),
  paymentMethod: paymentMethodSchema,
  paymentStatus: paymentStatusSchema,
  orderNotes: z.string().trim().max(1000).optional(),
  status: invoiceStatusSchema,
});

export type OrderValidatedValues = z.infer<typeof orderFormSchema>;
