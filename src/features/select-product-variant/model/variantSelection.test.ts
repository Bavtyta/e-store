import type { ProductVariant, VariantOptionValue } from '@/entities/product';

import {
  findSelectedVariant,
  getInitialVariantSelection,
  isVariantOptionAvailable,
  resolveVariantOptionSelection,
} from './variantSelection';

function option(code: string, value: string): VariantOptionValue {
  return {
    code,
    label: value,
    value,
  };
}

function variant(
  id: string,
  optionValues: readonly VariantOptionValue[],
  status: ProductVariant['availability']['status'] = 'in_stock',
): ProductVariant {
  return {
    attributes: [],
    availability: {
      message: null,
      status,
    },
    availableQuantity: status === 'out_of_stock' ? null : '10',
    externalId: null,
    id,
    imageId: null,
    maxOrderQuantity: null,
    minOrderQuantity: '1',
    name: id,
    oldPrice: null,
    optionValues: [...optionValues],
    packageQuantity: null,
    price: {
      amountMinor: 10_000,
      currency: 'RUB',
    },
    priceType: 'fixed',
    quantityStep: '1',
    sku: id.toUpperCase(),
    unit: {
      code: 'piece',
      label: 'шт.',
    },
  };
}

describe('product variant selection', () => {
  it('selects the first available variant and skips an out-of-stock one', () => {
    const variants = [
      variant('variant-out', [option('diameter', '20')], 'out_of_stock'),
      variant('variant-available', [option('diameter', '25')]),
    ];
    const selection = getInitialVariantSelection(variants);

    expect(selection).toEqual({
      diameter: '25',
    });
    expect(findSelectedVariant(variants, selection)?.id).toBe('variant-available');
  });

  it('keeps a valid combination and rejects a missing combination', () => {
    const variants = [
      variant('20-pn20', [option('diameter', '20'), option('pressure', 'pn20')]),
      variant('20-pn25', [option('diameter', '20'), option('pressure', 'pn25')]),
      variant('25-pn20', [option('diameter', '25'), option('pressure', 'pn20')]),
    ];
    const initialSelection = getInitialVariantSelection(variants);
    const diameterSelection = resolveVariantOptionSelection(
      variants,
      initialSelection,
      'diameter',
      '25',
    );

    expect(diameterSelection).toEqual({
      diameter: '25',
      pressure: 'pn20',
    });
    expect(isVariantOptionAvailable(variants, diameterSelection, 'pressure', 'pn25')).toBe(false);
    expect(resolveVariantOptionSelection(variants, diameterSelection, 'pressure', 'pn25')).toBe(
      diameterSelection,
    );
  });

  it('selects a product variant without option groups', () => {
    const variants = [variant('single', [])];
    const selection = getInitialVariantSelection(variants);

    expect(selection).toEqual({});
    expect(findSelectedVariant(variants, selection)?.id).toBe('single');
  });
});
