import { z } from 'zod';

import { productAvailabilitySchema } from '@/validation/enums';

export const productCategorySchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).optional().nullable(),
  availability: productAvailabilitySchema.default('available'),
  sort_order: z.number().int().min(0).default(0),
});

export const colorSchema = z.object({
  color_name: z.string().trim().min(1).max(80),
  hex_color: z
    .string()
    .trim()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Enter a valid hex color.'),
  availability: productAvailabilitySchema.default('available'),
  description: z.string().trim().max(500).optional().nullable(),
});

export const productSchema = z.object({
  category_id: z.string().uuid().optional().nullable(),
  product_name: z.string().trim().min(1).max(160),
  stem_count: z.number().int().positive().optional().nullable(),
  base_price: z.number().min(0),
  availability: productAvailabilitySchema.default('available'),
  description: z.string().trim().max(1000).optional().nullable(),
  colorIds: z.array(z.string().uuid()).default([]),
});

export const addonSchema = z.object({
  addon_name: z.string().trim().min(1).max(160),
  price: z.number().min(0),
  availability: productAvailabilitySchema.default('available'),
  description: z.string().trim().max(1000).optional().nullable(),
});

export type ProductCategoryFormValues = z.infer<typeof productCategorySchema>;
export type ColorFormValues = z.infer<typeof colorSchema>;
export type ProductFormValues = z.infer<typeof productSchema>;
export type AddonFormValues = z.infer<typeof addonSchema>;
