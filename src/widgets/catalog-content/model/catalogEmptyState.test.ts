import { getCatalogEmptyReason } from './catalogEmptyState';

describe('getCatalogEmptyReason', () => {
  it.each([
    [{ hasCategory: false, hasFilters: true, hasSearch: true }, 'search_and_filters'],
    [{ hasCategory: false, hasFilters: false, hasSearch: true }, 'search'],
    [{ hasCategory: true, hasFilters: true, hasSearch: false }, 'filters'],
    [{ hasCategory: true, hasFilters: false, hasSearch: false }, 'category'],
    [{ hasCategory: false, hasFilters: false, hasSearch: false }, 'catalog'],
  ] as const)('returns %s for %o', (input, expected) => {
    expect(getCatalogEmptyReason(input)).toBe(expected);
  });
});
