import { z } from 'zod';

export const customerSchema = z.object({
  customer_code: z.string().min(1),
  full_name: z.string().min(1),
  phone_number: z.string().min(7),
  delivery_address: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;
