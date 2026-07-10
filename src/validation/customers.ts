import { z } from 'zod';

const philippineMobilePattern = /^(09\d{9}|\+639\d{9})$/;

export const customerSchema = z.object({
  customer_code: z.string().trim().min(1),
  full_name: z.string().trim().min(1).max(160),
  phone_number: z
    .string()
    .trim()
    .regex(philippineMobilePattern, 'Enter a valid Philippine mobile number.'),
  delivery_address: z.string().trim().min(1).max(500),
  notes: z.string().trim().max(1000).optional().nullable(),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;
