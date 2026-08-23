export type CatalogEmptyReason =
  'search' | 'filters' | 'search_and_filters' | 'category' | 'catalog';

export type CatalogRecoveryAction =
  'clear_search' | 'clear_filters' | 'view_all_catalog' | 'view_parent_category' | 'go_home';

export interface CatalogEmptyBrowseTarget {
  action: Extract<CatalogRecoveryAction, 'view_all_catalog' | 'view_parent_category' | 'go_home'>;
  label: string;
  to: string;
}

export function getCatalogEmptyReason({
  hasCategory,
  hasFilters,
  hasSearch,
}: {
  hasCategory: boolean;
  hasFilters: boolean;
  hasSearch: boolean;
}): CatalogEmptyReason {
  if (hasSearch && hasFilters) {
    return 'search_and_filters';
  }

  if (hasSearch) {
    return 'search';
  }

  if (hasFilters) {
    return 'filters';
  }

  return hasCategory ? 'category' : 'catalog';
}
