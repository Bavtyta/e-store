import { z } from 'zod';

import { paginationSchema } from '@/shared/api';

import { cartResolvedVariantSchema, productListItemSchema } from '../model/product';

export const productSortSchema = z.enum([
  'relevance',
  'price_asc',
  'price_desc',
  'name_asc',
  'name_desc',
]);

export const productListResponseSchema = z.strictObject({
  items: z.array(productListItemSchema),
  pagination: paginationSchema,
});

export const resolveVariantsRequestSchema = z.strictObject({
  variantIds: z.array(z.string()),
});

export const resolveVariantsResponseSchema = z.strictObject({
  items: z.array(cartResolvedVariantSchema),
  missingVariantIds: z.array(z.string()),
});

export type ProductSort = z.infer<typeof productSortSchema>;
export type ProductListResponse = z.infer<typeof productListResponseSchema>;
export type ResolveVariantsRequest = z.infer<typeof resolveVariantsRequestSchema>;
export type ResolveVariantsResponse = z.infer<typeof resolveVariantsResponseSchema>;

export interface ProductListParams {
  category?: string;
  filters?: Readonly<Record<string, string>>;
  limit?: number;
  page?: number;
  search?: string;
  sort?: ProductSort;
}

export function mapProductListResponseDto(dto: unknown) {
  return productListResponseSchema.safeParse(dto);
}

export function mapResolveVariantsResponseDto(dto: unknown) {
  return resolveVariantsResponseSchema.safeParse(dto);
}
