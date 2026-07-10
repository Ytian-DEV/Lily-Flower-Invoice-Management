import { z } from 'zod';

import {
  invoiceStatusSchema,
  paymentMethodSchema,
  paymentStatusSchema,
} from '@/validation/enums';

const orderLineSchema = z
  .object({
    id: z.string().min(1),
    quantity: z.number().int().positive(),
    unitPrice: z.number().min(0),
    totalPrice: z.number().min(0),

    colorId: z.string().uuid().nullable(),
    colorName: z.string().trim().min(1, 'Bouquet color is required.'),
    customColorName: z.string().trim().optional().nullable(),
    isCustomColor: z.boolean(),
  })
  .refine((line) => !line.isCustomColor || Boolean(line.customColorName?.trim()), {
    message: 'Custom color name is required.',
    path: ['customColorName'],
  });

const addonLineSchema = z.object({
  id: z.string().min(1),
  quantity: z.number().int().positive(),
  unitPrice: z.number().min(0),
  totalPrice: z.number().min(0),
});

export const orderFormSchema = z.object({
  customerId: z.preprocess(
    (value) => (value === '' ? null : value),
    z.string().uuid().nullable(),
  ),

  customerName: z.string().trim().min(1),
  phoneNumber: z.string().trim().min(7),
  deliveryAddress: z.string().trim().min(1),
  deliveryDate: z.string().min(1),

  products: z.array(orderLineSchema).min(1, 'Add at least one bouquet.'),
  addons: z.array(addonLineSchema).default([]),

  discountPercent: z.number().min(0).max(100),
  deliveryFee: z.number().min(0),
  downpaymentPercent: z.number().min(0).max(100),

  paymentMethod: paymentMethodSchema,
  paymentStatus: paymentStatusSchema,

  orderNotes: z.string().trim().max(1000).optional(),

  status: invoiceStatusSchema,
});

export type OrderValidatedValues = z.infer<typeof orderFormSchema>;
