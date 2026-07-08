import { z } from 'zod';

import { productAvailabilitySchema } from '@/validation/enums';

export const productCategorySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  sort_order: z.number().int().min(0).default(0),
});

export const productSchema = z.object({
  category_id: z.string().uuid().optional().nullable(),
  product_name: z.string().min(1),
  stem_count: z.number().int().min(0).optional().nullable(),
  base_price: z.number().min(0),
  availability: productAvailabilitySchema.default('available'),
  description: z.string().optional().nullable(),
});

export const addonSchema = z.object({
  addon_name: z.string().min(1),
  price: z.number().min(0),
  availability: productAvailabilitySchema.default('available'),
});

export type ProductCategoryFormValues = z.infer<typeof productCategorySchema>;
export type ProductFormValues = z.infer<typeof productSchema>;
export type AddonFormValues = z.infer<typeof addonSchema>;
