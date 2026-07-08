import { z } from 'zod';

import { invoiceStatusSchema, paymentMethodSchema } from '@/validation/enums';

export const invoiceItemSchema = z.object({
  product_id: z.string().uuid().optional().nullable(),
  quantity: z.number().int().positive(),
  unit_price: z.number().min(0),
  total_price: z.number().min(0),
});

export const invoiceAddonSchema = z.object({
  addon_id: z.string().uuid().optional().nullable(),
  quantity: z.number().int().positive(),
  unit_price: z.number().min(0),
  total_price: z.number().min(0),
});

export const invoiceSchema = z.object({
  invoice_number: z.string().min(1),
  customer_id: z.string().uuid().optional().nullable(),
  subtotal: z.number().min(0).default(0),
  discount_percent: z.number().min(0).default(0),
  discount_amount: z.number().min(0).default(0),
  delivery_fee: z.number().min(0).default(0),
  total_amount: z.number().min(0).default(0),
  downpayment_amount: z.number().min(0).default(0),
  remaining_balance: z.number().min(0).default(0),
  status: invoiceStatusSchema.default('pending'),
  notes: z.string().optional().nullable(),
  delivery_date: z.string().optional().nullable(),
  delivery_address: z.string().optional().nullable(),
  payment_method: paymentMethodSchema.optional().nullable(),
  items: z.array(invoiceItemSchema).default([]),
  addons: z.array(invoiceAddonSchema).default([]),
});

export type InvoiceFormValues = z.infer<typeof invoiceSchema>;
export type InvoiceItemFormValues = z.infer<typeof invoiceItemSchema>;
export type InvoiceAddonFormValues = z.infer<typeof invoiceAddonSchema>;
