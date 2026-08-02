import { fireEvent, render, screen } from '@testing-library/react';

import { useCartStore } from '@/entities/cart';
import type { ProductVariant } from '@/entities/product';

import { AddToCartButton } from './AddToCartButton';

function createVariant(
  status: ProductVariant['availability']['status'] = 'in_stock',
): ProductVariant {
  return {
    attributes: [],
    availability: {
      message: null,
      status,
    },
    availableQuantity: status === 'out_of_stock' ? null : '100',
    externalId: null,
    id: `variant-${status}`,
    imageId: null,
    maxOrderQuantity: null,
    minOrderQuantity: '0.5',
    name: 'Тестовый вариант',
    oldPrice: null,
    optionValues: [],
    packageQuantity: null,
    price: {
      amountMinor: 1_000,
      currency: 'RUB',
    },
    priceType: 'fixed',
    quantityStep: '0.5',
    sku: 'SKU-TEST',
    unit: {
      code: 'meter',
      label: 'м',
    },
  };
}

beforeEach(() => {
  useCartStore.setState({
    hasHydrated: true,
    items: [],
  });
  useCartStore.persist.clearStorage();
});

describe('AddToCartButton', () => {
  it('adds the selected variant with its minimum quantity and shows feedback', () => {
    render(<AddToCartButton variant={createVariant()} />);

    fireEvent.click(screen.getByRole('button', { name: 'В корзину' }));

    expect(useCartStore.getState().items).toEqual([
      expect.objectContaining({
        quantity: '0.5',
        variantId: 'variant-in_stock',
      }),
    ]);
    expect(screen.getByRole('status')).toHaveTextContent('Товар добавлен в корзину');
  });

  it('blocks an out-of-stock variant but allows an on-order one', () => {
    const { rerender } = render(<AddToCartButton variant={createVariant('out_of_stock')} />);

    expect(screen.getByRole('button', { name: 'В корзину' })).toBeDisabled();

    rerender(<AddToCartButton variant={createVariant('on_order')} />);
    expect(screen.getByRole('button', { name: 'В корзину' })).toBeEnabled();
  });
});
