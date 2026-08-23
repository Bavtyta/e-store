import type { ProductFacet } from '@/entities/product';

import { interpretProductSearch } from './interpretProductSearch';

const facets: readonly ProductFacet[] = [
  {
    code: 'material',
    name: 'Материал',
    options: [
      { count: 4, label: 'ПВХ', selected: false, value: 'ПВХ' },
      { count: 2, label: 'Сталь', selected: false, value: 'Сталь' },
    ],
    type: 'checkbox',
  },
  {
    code: 'diameter',
    name: 'Диаметр, мм',
    options: [{ count: 3, label: '110', selected: false, value: '110' }],
    type: 'checkbox',
  },
  {
    code: 'availability',
    name: 'Наличие',
    options: [{ count: 8, label: 'В наличии', selected: false, value: 'in_stock' }],
    type: 'checkbox',
  },
];

describe('interpretProductSearch', () => {
  it('moves unambiguous facet terms into visible selections', () => {
    expect(interpretProductSearch('труба ПВХ 110 мм в наличии', facets)).toEqual({
      facetSelections: {
        availability: ['in_stock'],
        diameter: ['110'],
        material: ['ПВХ'],
      },
      query: 'труба',
    });
  });

  it('does not treat an unqualified number as a diameter', () => {
    expect(interpretProductSearch('труба 110', facets)).toEqual({
      facetSelections: {},
      query: 'труба 110',
    });
  });
});
