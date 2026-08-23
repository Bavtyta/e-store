import { renderHook } from '@testing-library/react';
import type { PropsWithChildren } from 'react';

import { AnalyticsProvider } from '@/shared/lib';
import type { AnalyticsReporter } from '@/shared/lib';

import { createCatalogAnalytics } from './catalogAnalytics';
import { useCatalogAnalytics } from './useCatalogAnalytics';

describe('catalog analytics', () => {
  it('emits only the fixed event names through its reporter methods', () => {
    const trackEvent = vi.fn<AnalyticsReporter['trackEvent']>();
    const catalogAnalytics = createCatalogAnalytics(
      { trackEvent },
      { categoryId: null, surface: 'catalog' },
    );

    catalogAnalytics.trackSearchSubmitted({ queryLength: 8, recognizedFilterCount: 1 });
    catalogAnalytics.trackFilterApplied({
      filterCode: 'diameter',
      interaction: 'sidebar',
      selectedCount: 2,
    });
    catalogAnalytics.trackFilterRemoved({
      filterCode: 'diameter',
      interaction: 'summary',
      selectedCount: 1,
    });
    catalogAnalytics.trackFiltersReset({
      interaction: 'empty_state',
      previousFilterGroupCount: 2,
      previousFilterValueCount: 3,
    });
    catalogAnalytics.trackSortChanged({ interaction: 'toolbar', sort: 'price_asc' });
    catalogAnalytics.trackResultsViewed({
      emptyReason: 'none',
      filterGroupCount: 1,
      filterValueCount: 2,
      hasSearch: true,
      page: 2,
      queryLength: 8,
      resultCount: 24,
      sort: 'price_asc',
    });
    catalogAnalytics.trackProductOpened({
      page: 2,
      position: 3,
      productId: 'product-42',
      trigger: 'title',
    });
    catalogAnalytics.trackAddToCart({
      page: 2,
      position: 3,
      productId: 'product-42',
      quantity: '2.5',
      variantId: 'variant-9',
    });
    catalogAnalytics.trackVariantSelectionRequested({
      page: 2,
      position: 4,
      productId: 'product-43',
      variantCount: 3,
    });
    catalogAnalytics.trackRecoverySelected({
      action: 'clear_search',
      emptyReason: 'search',
    });

    expect(trackEvent.mock.calls.map(([event]) => event.name)).toEqual([
      'catalog_search_submitted',
      'catalog_filter_applied',
      'catalog_filter_removed',
      'catalog_filters_reset',
      'catalog_sort_changed',
      'catalog_results_viewed',
      'catalog_product_opened',
      'catalog_add_to_cart',
      'catalog_variant_selection_requested',
      'catalog_recovery_selected',
    ]);
    expect(trackEvent).toHaveBeenNthCalledWith(6, {
      name: 'catalog_results_viewed',
      properties: {
        category_id: 'all',
        empty_reason: 'none',
        filter_group_count: 1,
        filter_value_count: 2,
        has_search: true,
        page: 2,
        query_length: 8,
        result_count: 24,
        sort: 'price_asc',
        surface: 'catalog',
      },
    });
  });

  it('sanitizes identifiers, quantity, and bounded numeric properties', () => {
    const trackEvent = vi.fn<AnalyticsReporter['trackEvent']>();
    const privateValue = 'customer@example.com /catalog?search=private';
    const catalogAnalytics = createCatalogAnalytics(
      { trackEvent },
      { categoryId: privateValue, surface: 'category' },
    );

    catalogAnalytics.trackAddToCart({
      page: Number.NaN,
      position: -4,
      productId: privateValue,
      quantity: `2;${privateValue}`,
      variantId: privateValue,
    });

    expect(trackEvent).toHaveBeenCalledWith({
      name: 'catalog_add_to_cart',
      properties: {
        category_id: 'unknown',
        page: 1,
        position: 1,
        product_id: 'unknown',
        quantity: 'unknown',
        surface: 'category',
        variant_id: 'unknown',
      },
    });
    expect(JSON.stringify(trackEvent.mock.calls)).not.toContain(privateValue);
  });

  it('caps query lengths and counts without accepting the raw query', () => {
    const trackEvent = vi.fn<AnalyticsReporter['trackEvent']>();
    const catalogAnalytics = createCatalogAnalytics(
      { trackEvent },
      { categoryId: null, surface: 'catalog' },
    );

    catalogAnalytics.trackSearchSubmitted({
      queryLength: Number.POSITIVE_INFINITY,
      recognizedFilterCount: -10,
    });

    expect(trackEvent).toHaveBeenCalledWith({
      name: 'catalog_search_submitted',
      properties: {
        category_id: 'all',
        query_length: 0,
        recognized_filter_count: 0,
        surface: 'catalog',
      },
    });
  });

  it('does not expose failures from an injected reporter', () => {
    const catalogAnalytics = createCatalogAnalytics(
      {
        trackEvent: () => {
          throw new Error('provider failure');
        },
      },
      { categoryId: null, surface: 'catalog' },
    );

    expect(() => {
      catalogAnalytics.trackSortChanged({ interaction: 'toolbar', sort: 'relevance' });
    }).not.toThrow();
  });

  it('connects the catalog hook to the shared provider', () => {
    const trackEvent = vi.fn<AnalyticsReporter['trackEvent']>();
    const reporter: AnalyticsReporter = { trackEvent };
    const wrapper = ({ children }: PropsWithChildren) => (
      <AnalyticsProvider reporter={reporter}>{children}</AnalyticsProvider>
    );
    const { result } = renderHook(
      () => useCatalogAnalytics({ categoryId: 'pipes', surface: 'category' }),
      { wrapper },
    );

    result.current.trackVariantSelectionRequested({
      page: 1,
      position: 4,
      productId: 'product-42',
      variantCount: 5,
    });

    expect(trackEvent).toHaveBeenCalledWith({
      name: 'catalog_variant_selection_requested',
      properties: {
        category_id: 'pipes',
        page: 1,
        position: 4,
        product_id: 'product-42',
        surface: 'category',
        variant_count: 5,
      },
    });
  });
});
