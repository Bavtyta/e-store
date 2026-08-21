import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { useCartStore } from '@/entities/cart';
import type { ProductListItem } from '@/entities/product';

import { ProductCardAddToCartButton } from './ProductCardAddToCartButton';

function createProduct(overrides: Partial<ProductListItem> = {}): ProductListItem {
  return {
    addToCartTarget: {
      id: 'product-1-variant-25',
      maxOrderQuantity: null,
      minOrderQuantity: '1',
      quantityStep: '1',
    },
    availability: {
      message: 'В наличии',
      status: 'in_stock',
    },
    badges: [],
    categoryId: 'category-pipes',
    id: 'product-1',
    name: 'Труба для проверки покупки',
    priceFrom: {
      amountMinor: 12_500,
      currency: 'RUB',
    },
    priceTo: null,
    primaryUnit: {
      code: 'meter',
      label: 'м',
    },
    shortAttributes: [],
    slug: 'test-pipe',
    thumbnail: null,
    ...overrides,
  };
}

beforeEach(() => {
  useCartStore.setState({
    hasHydrated: true,
    items: [],
  });
  useCartStore.persist.clearStorage();
});

describe('ProductCardAddToCartButton', () => {
  it('adds the primary variant with its minimum quantity', () => {
    render(<ProductCardAddToCartButton product={createProduct()} />);

    fireEvent.click(screen.getByRole('button', { name: 'В корзину' }));

    expect(useCartStore.getState().items).toEqual([
      expect.objectContaining({
        quantity: '1',
        variantId: 'product-1-variant-25',
      }),
    ]);
  });

  it('is disabled for out-of-stock products', () => {
    render(
      <ProductCardAddToCartButton
        product={createProduct({
          availability: {
            message: 'Нет в наличии',
            status: 'out_of_stock',
          },
        })}
      />,
    );

    expect(screen.getByRole('button', { name: 'В корзину' })).toBeDisabled();
  });

  it('is disabled when the product has no add-to-cart target', () => {
    render(<ProductCardAddToCartButton product={createProduct({ addToCartTarget: null })} />);

    expect(screen.getByRole('button', { name: 'В корзину' })).toBeDisabled();
  });
});