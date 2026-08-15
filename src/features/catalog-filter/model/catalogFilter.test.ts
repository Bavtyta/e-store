import { describe, expect, it } from 'vitest';

import {
  applyCatalogFilterChanges,
  catalogFilterKeys,
  createProductFilterParams,
  emptyCatalogFilterState,
  isCatalogFilterActive,
  parseCatalogFilterState,
  removeCatalogFilterParams,
} from './catalogFilter';

describe('catalogFilter model', () => {
  it('parses an empty query into the empty filter state', () => {
    expect(parseCatalogFilterState(new URLSearchParams())).toEqual(emptyCatalogFilterState);
    expect(isCatalogFilterActive(emptyCatalogFilterState)).toBe(false);
  });

  it('parses diameter, material and price parameters', () => {
    const state = parseCatalogFilterState(
      new URLSearchParams({
        [catalogFilterKeys.diameter]: '25,32',
        [catalogFilterKeys.material]: 'ПНД',
        [catalogFilterKeys.priceMax]: '15000',
        [catalogFilterKeys.priceMin]: '1000',
      }),
    );

    expect(state).toEqual({
      diameters: ['25', '32'],
      material: 'ПНД',
      priceMax: '15000',
      priceMin: '1000',
    });
    expect(isCatalogFilterActive(state)).toBe(true);
  });

  it('ignores blank filter values', () => {
    const state = parseCatalogFilterState(
      new URLSearchParams({
        [catalogFilterKeys.diameter]: '25,,32',
        [catalogFilterKeys.material]: '',
        [catalogFilterKeys.priceMax]: '',
      }),
    );

    expect(state.diameters).toEqual(['25', '32']);
    expect(state.material).toBeNull();
    expect(state.priceMax).toBeNull();
  });

  it('applies partial changes without touching unrelated parameters', () => {
    const source = new URLSearchParams({
      'filter[diameter]': '50',
      search: 'труба',
    });

    const next = applyCatalogFilterChanges(source, { material: 'ПВХ' });

    expect(next.get('search')).toBe('труба');
    expect(next.get('filter[diameter]')).toBe('50');
    expect(next.get('filter[material]')).toBe('ПВХ');
  });

  it('removes empty values instead of storing them', () => {
    const source = new URLSearchParams({
      'filter[material]': 'ПНД',
      'filter[diameter]': '25',
    });

    const next = applyCatalogFilterChanges(source, { material: null, diameters: [] });

    expect(next.has('filter[material]')).toBe(false);
    expect(next.has('filter[diameter]')).toBe(false);
  });

  it('drops every filter parameter and keeps unrelated ones', () => {
    const source = new URLSearchParams({
      'filter[diameter]': '25',
      'filter[material]': 'ПНД',
      page: '2',
      price_max: '15000',
      price_min: '1000',
      search: 'труба',
    });

    const next = removeCatalogFilterParams(source);

    expect(next.has(catalogFilterKeys.diameter)).toBe(false);
    expect(next.has(catalogFilterKeys.material)).toBe(false);
    expect(next.has(catalogFilterKeys.priceMax)).toBe(false);
    expect(next.has(catalogFilterKeys.priceMin)).toBe(false);
    expect(next.get('page')).toBe('2');
    expect(next.get('search')).toBe('труба');
  });

  it('creates API query parameters for the active filter state', () => {
    expect(createProductFilterParams(emptyCatalogFilterState)).toEqual({
      filters: {},
    });
    expect(
      createProductFilterParams({
        diameters: ['25', '32'],
        material: 'ПНД',
        priceMax: '15000.5',
        priceMin: '0',
      }),
    ).toEqual({
      filters: {
        diameter: '25,32',
        material: 'ПНД',
      },
      priceMax: 15000.5,
      priceMin: 0,
    });
  });

  it('skips invalid price strings in the API query', () => {
    expect(
      createProductFilterParams({
        diameters: [],
        material: null,
        priceMax: 'abc',
        priceMin: '-5',
      }),
    ).toEqual({
      filters: {},
    });
  });
});