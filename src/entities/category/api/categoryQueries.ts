import { useQuery } from '@tanstack/react-query';

import { shouldRetryApiRequest } from '@/shared/api';

import { getCategories, getCategory } from './categoryApi';

const CATEGORY_STALE_TIME = 10 * 60 * 1_000;
const CATEGORY_GC_TIME = 30 * 60 * 1_000;

export const categoryQueryKeys = {
  all: ['categories'] as const,
  detail: (categoryPath: string) => [...categoryQueryKeys.all, 'detail', categoryPath] as const,
  list: () => [...categoryQueryKeys.all, 'list'] as const,
};

export function useCategoriesQuery() {
  return useQuery({
    gcTime: CATEGORY_GC_TIME,
    queryFn: ({ signal }) => getCategories(signal),
    queryKey: categoryQueryKeys.list(),
    retry: shouldRetryApiRequest,
    staleTime: CATEGORY_STALE_TIME,
  });
}

export function useCategoryQuery(categoryPath: string) {
  return useQuery({
    enabled: categoryPath.length > 0,
    gcTime: CATEGORY_GC_TIME,
    queryFn: ({ signal }) => getCategory(categoryPath, signal),
    queryKey: categoryQueryKeys.detail(categoryPath),
    retry: shouldRetryApiRequest,
    staleTime: CATEGORY_STALE_TIME,
  });
}
