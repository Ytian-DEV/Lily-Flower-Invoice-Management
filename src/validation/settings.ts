import { z } from 'zod';

export const settingsSchema = z.object({
  business_name: z.string().trim().min(1, 'Business name is required.'),
  business_address: z.string().trim().min(1, 'Business address is required.'),
  phone_1: z
    .string()
    .trim()
    .regex(/^(\+63|0)9\d{9}$/, 'Enter a valid PH mobile number.'),
  phone_2: z
    .string()
    .trim()
    .regex(/^(\+63|0)9\d{9}$/, 'Enter a valid PH mobile number.')
    .optional()
    .or(z.literal(''))
    .nullable(),
  facebook: z.string().trim().optional().nullable(),
  invoice_prefix: z.string().trim().min(1).max(12).default('INV'),
  default_downpayment_percent: z.number().min(0).max(100).default(30),
});

export type SettingsFormValues = z.infer<typeof settingsSchema>;
