import type { ProductSort } from '@/entities/product';
import type { AnalyticsProperties, AnalyticsReporter } from '@/shared/lib';

const maximumCount = 1_000_000;
const maximumIdentifierLength = 128;
const maximumQueryLength = 512;
const maximumQuantityLength = 32;
const safeIdentifierPattern = /^[A-Za-z0-9][A-Za-z0-9._:-]*$/;
const safeQuantityPattern = /^\d+(?:\.\d+)?$/;

export type CatalogAnalyticsSurface = 'catalog' | 'category';
export type CatalogFilterInteraction = 'empty_state' | 'mobile_drawer' | 'sidebar' | 'summary';
export type CatalogSortInteraction = 'mobile_drawer' | 'toolbar';
export type CatalogEmptyReason =
  'catalog' | 'category' | 'filters' | 'none' | 'search' | 'search_and_filters';
export type CatalogRecoveryAction =
  'clear_filters' | 'clear_search' | 'go_home' | 'view_all_catalog' | 'view_parent_category';
export type CatalogProductOpenTrigger = 'image' | 'title';

export type CatalogAnalyticsEventName =
  | 'catalog_add_to_cart'
  | 'catalog_filter_applied'
  | 'catalog_filter_removed'
  | 'catalog_filters_reset'
  | 'catalog_product_opened'
  | 'catalog_recovery_selected'
  | 'catalog_results_viewed'
  | 'catalog_search_submitted'
  | 'catalog_sort_changed'
  | 'catalog_variant_selection_requested';

export interface CatalogAnalyticsContext {
  readonly categoryId: string | null;
  readonly surface: CatalogAnalyticsSurface;
}

export interface CatalogSearchSubmittedInput {
  readonly queryLength: number;
  readonly recognizedFilterCount: number;
}

export interface CatalogFilterChangeInput {
  readonly filterCode: string;
  readonly interaction: CatalogFilterInteraction;
  readonly selectedCount: number;
}

export interface CatalogFiltersResetInput {
  readonly interaction: CatalogFilterInteraction;
  readonly previousFilterGroupCount: number;
  readonly previousFilterValueCount: number;
}

export interface CatalogSortChangedInput {
  readonly interaction: CatalogSortInteraction;
  readonly sort: ProductSort;
}

export interface CatalogResultsViewedInput {
  readonly emptyReason: CatalogEmptyReason;
  readonly filterGroupCount: number;
  readonly filterValueCount: number;
  readonly hasSearch: boolean;
  readonly page: number;
  readonly queryLength: number;
  readonly resultCount: number;
  readonly sort: ProductSort;
}

export interface CatalogProductOpenedInput {
  readonly page: number;
  readonly position: number;
  readonly productId: string;
  readonly trigger: CatalogProductOpenTrigger;
}

export interface CatalogAddToCartInput {
  readonly page: number;
  readonly position: number;
  readonly productId: string;
  readonly quantity: string;
  readonly variantId: string;
}

export interface CatalogVariantSelectionRequestedInput {
  readonly page: number;
  readonly position: number;
  readonly productId: string;
  readonly variantCount: number;
}

export interface CatalogRecoverySelectedInput {
  readonly action: CatalogRecoveryAction;
  readonly emptyReason: Exclude<CatalogEmptyReason, 'none'>;
}

export interface CatalogAnalyticsReporter {
  readonly trackAddToCart: (input: CatalogAddToCartInput) => void;
  readonly trackFilterApplied: (input: CatalogFilterChangeInput) => void;
  readonly trackFilterRemoved: (input: CatalogFilterChangeInput) => void;
  readonly trackFiltersReset: (input: CatalogFiltersResetInput) => void;
  readonly trackProductOpened: (input: CatalogProductOpenedInput) => void;
  readonly trackRecoverySelected: (input: CatalogRecoverySelectedInput) => void;
  readonly trackResultsViewed: (input: CatalogResultsViewedInput) => void;
  readonly trackSearchSubmitted: (input: CatalogSearchSubmittedInput) => void;
  readonly trackSortChanged: (input: CatalogSortChangedInput) => void;
  readonly trackVariantSelectionRequested: (input: CatalogVariantSelectionRequestedInput) => void;
}

function sanitizeIdentifier(value: string, fallback = 'unknown'): string {
  const normalized = value.trim();

  return normalized.length > 0 &&
    normalized.length <= maximumIdentifierLength &&
    safeIdentifierPattern.test(normalized)
    ? normalized
    : fallback;
}

function sanitizeQuantity(value: string): string {
  const normalized = value.trim();

  return normalized.length > 0 &&
    normalized.length <= maximumQuantityLength &&
    safeQuantityPattern.test(normalized)
    ? normalized
    : 'unknown';
}

function sanitizeNonnegativeInteger(value: number, maximum = maximumCount): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(Math.max(Math.trunc(value), 0), maximum);
}

function sanitizePositiveInteger(value: number): number {
  return Math.max(sanitizeNonnegativeInteger(value), 1);
}

function sanitizeEnum(value: string, allowedValues: readonly string[]): string {
  return allowedValues.includes(value) ? value : 'unknown';
}

function sanitizeSort(sort: ProductSort): string {
  return sanitizeEnum(sort, ['relevance', 'price_asc', 'price_desc', 'name_asc', 'name_desc']);
}

export function createCatalogAnalytics(
  analytics: AnalyticsReporter,
  context: CatalogAnalyticsContext,
): CatalogAnalyticsReporter {
  const baseProperties: AnalyticsProperties = Object.freeze({
    category_id: context.categoryId === null ? 'all' : sanitizeIdentifier(context.categoryId),
    surface: sanitizeEnum(context.surface, ['catalog', 'category']),
  });

  function track(name: CatalogAnalyticsEventName, properties: AnalyticsProperties): void {
    try {
      analytics.trackEvent({
        name,
        properties: { ...baseProperties, ...properties },
      });
    } catch {
      // A custom analytics reporter must not interrupt catalog interactions.
    }
  }

  return Object.freeze({
    trackAddToCart: (input: CatalogAddToCartInput): void => {
      track('catalog_add_to_cart', {
        page: sanitizePositiveInteger(input.page),
        position: sanitizePositiveInteger(input.position),
        product_id: sanitizeIdentifier(input.productId),
        quantity: sanitizeQuantity(input.quantity),
        variant_id: sanitizeIdentifier(input.variantId),
      });
    },
    trackFilterApplied: (input: CatalogFilterChangeInput): void => {
      track('catalog_filter_applied', {
        filter_code: sanitizeIdentifier(input.filterCode),
        interaction: sanitizeEnum(input.interaction, [
          'empty_state',
          'mobile_drawer',
          'sidebar',
          'summary',
        ]),
        selected_count: sanitizeNonnegativeInteger(input.selectedCount),
      });
    },
    trackFilterRemoved: (input: CatalogFilterChangeInput): void => {
      track('catalog_filter_removed', {
        filter_code: sanitizeIdentifier(input.filterCode),
        interaction: sanitizeEnum(input.interaction, [
          'empty_state',
          'mobile_drawer',
          'sidebar',
          'summary',
        ]),
        selected_count: sanitizeNonnegativeInteger(input.selectedCount),
      });
    },
    trackFiltersReset: (input: CatalogFiltersResetInput): void => {
      track('catalog_filters_reset', {
        interaction: sanitizeEnum(input.interaction, [
          'empty_state',
          'mobile_drawer',
          'sidebar',
          'summary',
        ]),
        previous_filter_group_count: sanitizeNonnegativeInteger(input.previousFilterGroupCount),
        previous_filter_value_count: sanitizeNonnegativeInteger(input.previousFilterValueCount),
      });
    },
    trackProductOpened: (input: CatalogProductOpenedInput): void => {
      track('catalog_product_opened', {
        page: sanitizePositiveInteger(input.page),
        position: sanitizePositiveInteger(input.position),
        product_id: sanitizeIdentifier(input.productId),
        trigger: sanitizeEnum(input.trigger, ['image', 'title']),
      });
    },
    trackRecoverySelected: (input: CatalogRecoverySelectedInput): void => {
      track('catalog_recovery_selected', {
        action: sanitizeEnum(input.action, [
          'clear_filters',
          'clear_search',
          'go_home',
          'view_all_catalog',
          'view_parent_category',
        ]),
        empty_reason: sanitizeEnum(input.emptyReason, [
          'catalog',
          'category',
          'filters',
          'search',
          'search_and_filters',
        ]),
      });
    },
    trackResultsViewed: (input: CatalogResultsViewedInput): void => {
      track('catalog_results_viewed', {
        empty_reason: sanitizeEnum(input.emptyReason, [
          'catalog',
          'category',
          'filters',
          'none',
          'search',
          'search_and_filters',
        ]),
        filter_group_count: sanitizeNonnegativeInteger(input.filterGroupCount),
        filter_value_count: sanitizeNonnegativeInteger(input.filterValueCount),
        has_search: input.hasSearch,
        page: sanitizePositiveInteger(input.page),
        query_length: sanitizeNonnegativeInteger(input.queryLength, maximumQueryLength),
        result_count: sanitizeNonnegativeInteger(input.resultCount),
        sort: sanitizeSort(input.sort),
      });
    },
    trackSearchSubmitted: (input: CatalogSearchSubmittedInput): void => {
      track('catalog_search_submitted', {
        query_length: sanitizeNonnegativeInteger(input.queryLength, maximumQueryLength),
        recognized_filter_count: sanitizeNonnegativeInteger(input.recognizedFilterCount),
      });
    },
    trackSortChanged: (input: CatalogSortChangedInput): void => {
      track('catalog_sort_changed', {
        interaction: sanitizeEnum(input.interaction, ['mobile_drawer', 'toolbar']),
        sort: sanitizeSort(input.sort),
      });
    },
    trackVariantSelectionRequested: (input: CatalogVariantSelectionRequestedInput): void => {
      track('catalog_variant_selection_requested', {
        page: sanitizePositiveInteger(input.page),
        position: sanitizePositiveInteger(input.position),
        product_id: sanitizeIdentifier(input.productId),
        variant_count: sanitizePositiveInteger(input.variantCount),
      });
    },
  });
}
