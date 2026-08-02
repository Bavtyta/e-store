import { useMutation, useQuery } from '@tanstack/react-query';

import { shouldRetryApiRequest } from '@/shared/api';

import { getProduct, getProducts } from './productApi';
import type { ProductListParams, ResolveVariantsRequest } from './productApiContracts';
import { resolveProductVariants } from './variantApi';

const PRODUCT_STALE_TIME = 60 * 1_000;
const PRODUCT_GC_TIME = 5 * 60 * 1_000;

export const productQueryKeys = {
  all: ['products'] as const,
  detail: (slug: string) => [...productQueryKeys.all, 'detail', slug] as const,
  list: (params: ProductListParams = {}) => [...productQueryKeys.all, 'list', params] as const,
};

export function useProductsQuery(params: ProductListParams = {}) {
  return useQuery({
    gcTime: PRODUCT_GC_TIME,
    queryFn: ({ signal }) => getProducts(params, signal),
    queryKey: productQueryKeys.list(params),
    retry: shouldRetryApiRequest,
    staleTime: PRODUCT_STALE_TIME,
  });
}

export function useProductQuery(slug: string) {
  return useQuery({
    enabled: slug.length > 0,
    gcTime: PRODUCT_GC_TIME,
    queryFn: ({ signal }) => getProduct(slug, signal),
    queryKey: productQueryKeys.detail(slug),
    retry: shouldRetryApiRequest,
    staleTime: PRODUCT_STALE_TIME,
  });
}

export function useResolveProductVariantsMutation() {
  return useMutation({
    mutationFn: (request: ResolveVariantsRequest) => resolveProductVariants(request),
    retry: shouldRetryApiRequest,
  });
}
