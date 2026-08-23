import { describe, expect, it } from 'vitest';

import {
  applyCatalogFilterChanges,
  catalogFilterKeys,
  createProductFilterParams,
  emptyCatalogFilterState,
  getCatalogFilterCounts,
  isCatalogFilterActive,
  parseCatalogAttributeFilters,
  parseCatalogFacetSelections,
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
      materials: ['ПНД'],
      priceMax: '15000',
      priceMin: '1000',
    });
    expect(isCatalogFilterActive(state)).toBe(true);
  });

  it('parses arbitrary attribute filters for the products query', () => {
    expect(
      parseCatalogAttributeFilters(
        new URLSearchParams({
          'filter[brand]': 'Valtec,Lammin',
          'filter[material]': 'ПНД',
          search: 'труба',
        }),
      ),
    ).toEqual({
      brand: 'Valtec,Lammin',
      material: 'ПНД',
    });
  });

  it('parses selected facet values from the URL as arrays', () => {
    expect(
      parseCatalogFacetSelections(
        new URLSearchParams({
          'filter[application]': 'Питьевая вода,Отопление',
          'filter[material]': 'ПНД',
        }),
      ),
    ).toEqual({
      application: ['Питьевая вода', 'Отопление'],
      material: ['ПНД'],
    });
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
    expect(state.materials).toEqual([]);
    expect(state.priceMax).toBeNull();
  });

  it('applies partial changes without touching unrelated parameters', () => {
    const source = new URLSearchParams({
      'filter[diameter]': '50',
      search: 'труба',
    });

    const next = applyCatalogFilterChanges(source, { materials: ['ПВХ'] });

    expect(next.get('search')).toBe('труба');
    expect(next.get('filter[diameter]')).toBe('50');
    expect(next.get('filter[material]')).toBe('ПВХ');
  });

  it('removes empty values instead of storing them', () => {
    const source = new URLSearchParams({
      'filter[material]': 'ПНД',
      'filter[diameter]': '25',
    });

    const next = applyCatalogFilterChanges(source, { materials: [], diameters: [] });

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
        materials: ['ПНД'],
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
        materials: [],
        priceMax: 'abc',
        priceMin: '-5',
      }),
    ).toEqual({
      filters: {},
    });
  });

  it('counts filter groups and values without exposing their contents', () => {
    expect(
      getCatalogFilterCounts(
        {
          availability: ['in_stock'],
          material: ['ПНД', 'ПВХ'],
        },
        {
          diameters: [],
          materials: ['ПНД', 'ПВХ'],
          priceMax: '1000',
          priceMin: '100',
        },
      ),
    ).toEqual({ groupCount: 3, valueCount: 5 });
  });
});
