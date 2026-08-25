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

export const productFacetOptionSchema = z.strictObject({
  count: z.number().int().nonnegative(),
  label: z.string(),
  selected: z.boolean(),
  value: z.string(),
});

export const productFacetSchema = z.strictObject({
  code: z.string(),
  max: z.number().optional(),
  min: z.number().optional(),
  name: z.string(),
  options: z.array(productFacetOptionSchema).optional(),
  type: z.enum(['checkbox', 'range']),
});

export const productListResponseSchema = z.strictObject({
  facets: z.array(productFacetSchema).optional(),
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
export type ProductFacet = z.infer<typeof productFacetSchema>;
export type ProductFacetOption = z.infer<typeof productFacetOptionSchema>;
export type ProductListResponse = z.infer<typeof productListResponseSchema>;
export type ResolveVariantsRequest = z.infer<typeof resolveVariantsRequestSchema>;
export type ResolveVariantsResponse = z.infer<typeof resolveVariantsResponseSchema>;

export interface ProductListParams {
  category?: string;
  filters?: Readonly<Record<string, string>>;
  limit?: number;
  page?: number;
  priceMax?: number;
  priceMin?: number;
  search?: string;
  sort?: ProductSort;
}

export function mapProductListResponseDto(dto: unknown) {
  return productListResponseSchema.safeParse(dto);
}

export function mapResolveVariantsResponseDto(dto: unknown) {
  return resolveVariantsResponseSchema.safeParse(dto);
}
