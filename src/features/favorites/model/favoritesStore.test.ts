import { beforeEach, describe, expect, it } from 'vitest';

import { migrateFavoritesState, useFavoritesStore } from './favoritesStore';

describe('favorites store', () => {
  beforeEach(() => {
    useFavoritesStore.setState({ hasHydrated: true, productIds: [] });
  });

  it('toggles product ids without storing product data', () => {
    useFavoritesStore.getState().toggle('product-1');
    expect(useFavoritesStore.getState().productIds).toEqual(['product-1']);

    useFavoritesStore.getState().toggle('product-1');
    expect(useFavoritesStore.getState().productIds).toEqual([]);
  });

  it('sanitizes persisted state and removes duplicates', () => {
    expect(migrateFavoritesState({ productIds: ['product-1', 'product-1'] })).toEqual({
      productIds: ['product-1'],
    });
    expect(migrateFavoritesState({ productIds: [false] })).toEqual({ productIds: [] });
  });
});
