import { z } from 'zod';

export const settingsSchema = z.object({
  business_name: z.string().trim().min(1, 'Enter the shop name.'),
  business_address: z.string().trim().min(1, 'Enter the shop address.'),
  phone_1: z
    .string()
    .trim()
    .regex(/^(\+63|0)9\d{9}$/, 'Use a mobile number like 09171234567.'),
  phone_2: z
    .string()
    .trim()
    .regex(/^(\+63|0)9\d{9}$/, 'Use a mobile number like 09171234567.')
    .optional()
    .or(z.literal(''))
    .nullable(),
  facebook: z.string().trim().optional().nullable(),
  invoice_prefix: z
    .string()
    .trim()
    .regex(/^[A-Z0-9]{1,12}$/, 'Use letters and numbers only.')
    .default('INV'),
  default_downpayment_percent: z.number().min(0).max(100).default(50),
});

export type SettingsFormValues = z.infer<typeof settingsSchema>;
