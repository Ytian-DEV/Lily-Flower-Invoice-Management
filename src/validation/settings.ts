import { z } from 'zod';

export const settingsSchema = z.object({
  business_name: z.string().min(1),
  business_address: z.string().min(1),
  phone_1: z.string().min(7),
  phone_2: z.string().optional().nullable(),
  facebook: z.string().optional().nullable(),
  invoice_prefix: z.string().min(1).default('INV'),
  default_downpayment_percent: z.number().min(0).max(100).default(50),
});

export type SettingsFormValues = z.infer<typeof settingsSchema>;
