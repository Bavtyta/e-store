import { useMemo } from 'react';

import { useAnalytics } from '@/shared/lib';

import { createCatalogAnalytics } from './catalogAnalytics';
import type { CatalogAnalyticsContext, CatalogAnalyticsReporter } from './catalogAnalytics';

export function useCatalogAnalytics(context: CatalogAnalyticsContext): CatalogAnalyticsReporter {
  const analytics = useAnalytics();

  return useMemo(
    () =>
      createCatalogAnalytics(analytics, {
        categoryId: context.categoryId,
        surface: context.surface,
      }),
    [analytics, context.categoryId, context.surface],
  );
}
