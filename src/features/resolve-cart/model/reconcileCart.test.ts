import type { CartItem } from '@/entities/cart';
import type {
  CartResolvedVariant,
  ProductVariant,
  ResolveVariantsResponse,
} from '@/entities/product';

import { reconcileCart } from './reconcileCart';

const ADDED_AT = '2026-07-30T12:00:00.000Z';

function createVariant(id: string, overrides: Partial<ProductVariant> = {}): ProductVariant {
  return {
    attributes: [],
    availability: {
      message: 'В наличии',
      status: 'in_stock',
    },
    availableQuantity: '100',
    externalId: null,
    id,
    imageId: null,
    maxOrderQuantity: null,
    minOrderQuantity: '0.5',
    name: 'Вариант',
    oldPrice: null,
    optionValues: [],
    packageQuantity: null,
    price: {
      amountMinor: 1_000,
      currency: 'RUB',
    },
    priceType: 'fixed',
    quantityStep: '0.5',
    sku: id.toUpperCase(),
    unit: {
      code: 'meter',
      label: 'м',
    },
    ...overrides,
  };
}

function createResolvedVariant(variant: ProductVariant): CartResolvedVariant {
  return {
    product: {
      id: `product-${variant.id}`,
      image: null,
      name: `Товар ${variant.id}`,
      slug: `product-${variant.id}`,
    },
    variant,
  };
}

function createItem(variantId: string, quantity = '1.25'): CartItem {
  return {
    addedAt: ADDED_AT,
    quantity,
    variantId,
  };
}

describe('reconcileCart', () => {
  it('maps fresh API data, normalizes quantity and calculates a fixed-price line', () => {
    const variant = createVariant('variant-1');
    const response: ResolveVariantsResponse = {
      items: [createResolvedVariant(variant)],
      missingVariantIds: [],
    };

    const result = reconcileCart([createItem(variant.id)], response);

    expect(result.lines[0]).toMatchObject({
      lineTotalMinor: 1_500n,
      quantity: '1.5',
      status: 'available',
    });
    expect(result.totalMinor).toBe(1_500n);
    expect(result.excludedFromTotalCount).toBe(0);
  });

  it('keeps missing and out-of-stock variants visible but excludes them from total', () => {
    const unavailableVariant = createVariant('variant-out', {
      availability: {
        message: 'Нет в наличии',
        status: 'out_of_stock',
      },
    });
    const response: ResolveVariantsResponse = {
      items: [createResolvedVariant(unavailableVariant)],
      missingVariantIds: ['variant-missing'],
    };

    const result = reconcileCart(
      [createItem(unavailableVariant.id, '1'), createItem('variant-missing', '1')],
      response,
    );

    expect(result.lines.map((line) => line.status)).toEqual(['out-of-stock', 'missing']);
    expect(result.totalMinor).toBe(0n);
    expect(result.excludedFromTotalCount).toBe(2);
  });

  it('allows an on-order fixed-price variant and excludes non-fixed prices', () => {
    const onOrderVariant = createVariant('variant-order', {
      availability: {
        message: 'Под заказ',
        status: 'on_order',
      },
    });
    const onRequestVariant = createVariant('variant-request', {
      price: null,
      priceType: 'on_request',
    });
    const response: ResolveVariantsResponse = {
      items: [createResolvedVariant(onOrderVariant), createResolvedVariant(onRequestVariant)],
      missingVariantIds: [],
    };

    const result = reconcileCart(
      [createItem(onOrderVariant.id, '1'), createItem(onRequestVariant.id, '1')],
      response,
    );

    expect(result.lines[0]).toMatchObject({
      lineTotalMinor: 1_000n,
      status: 'available',
    });
    expect(result.lines[1]).toMatchObject({
      lineTotalMinor: null,
      status: 'available',
    });
    expect(result.totalMinor).toBe(1_000n);
    expect(result.excludedFromTotalCount).toBe(1);
  });
});
