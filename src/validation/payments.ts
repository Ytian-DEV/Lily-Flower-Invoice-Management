import { z } from 'zod';

import { paymentMethodSchema, paymentStatusSchema } from '@/validation/enums';

export const paymentSchema = z.object({
  invoice_id: z.string().uuid(),
  payment_method: paymentMethodSchema,
  amount: z.number().positive(),
  reference_number: z.string().optional().nullable(),
  payment_status: paymentStatusSchema.default('pending'),
  payment_date: z.string().min(1),
});

export const paymentReceiptSchema = z.object({
  payment_id: z.string().uuid(),
  image_url: z.string().min(1),
  ocr_reference: z.string().optional().nullable(),
  ocr_sender: z.string().optional().nullable(),
  ocr_amount: z.number().optional().nullable(),
  ocr_date: z.string().optional().nullable(),
  ocr_confidence: z.number().min(0).max(100).optional().nullable(),
  verified: z.boolean().default(false),
});

export type PaymentFormValues = z.infer<typeof paymentSchema>;
export type PaymentReceiptFormValues = z.infer<typeof paymentReceiptSchema>;
