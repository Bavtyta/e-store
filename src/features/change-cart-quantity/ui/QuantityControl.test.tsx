import { fireEvent, render, screen } from '@testing-library/react';

import { createCartQuantityRules, useCartStore } from '@/entities/cart';
import type { ProductVariant } from '@/entities/product';

import { QuantityControl } from './QuantityControl';

const VARIANT: ProductVariant = {
  attributes: [],
  availability: {
    message: 'В наличии',
    status: 'in_stock',
  },
  availableQuantity: '100',
  externalId: null,
  id: 'variant-quantity',
  imageId: null,
  maxOrderQuantity: '3',
  minOrderQuantity: '1',
  name: 'Тестовый вариант',
  oldPrice: null,
  optionValues: [],
  packageQuantity: null,
  price: {
    amountMinor: 1_000,
    currency: 'RUB',
  },
  priceType: 'fixed',
  quantityStep: '1',
  sku: 'SKU-QUANTITY',
  unit: {
    code: 'piece',
    label: 'шт.',
  },
};

function QuantityHarness() {
  const item = useCartStore((state) => state.items[0]);

  if (item === undefined) {
    return null;
  }

  return <QuantityControl itemName="Тестовый товар" quantity={item.quantity} variant={VARIANT} />;
}

beforeEach(() => {
  const rules = createCartQuantityRules('1', '1', '3');

  if (rules === null) {
    throw new Error('Для теста необходимы корректные правила количества.');
  }

  useCartStore.setState({
    hasHydrated: true,
    items: [],
  });
  useCartStore.persist.clearStorage();
  useCartStore.getState().addItem({
    addedAt: '2026-07-30T12:00:00.000Z',
    initialQuantity: '1',
    rules,
    variantId: VARIANT.id,
  });
});

describe('QuantityControl', () => {
  it('increments and decrements with accessible buttons', () => {
    render(<QuantityHarness />);

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Увеличить количество «Тестовый товар»',
      }),
    );
    expect(screen.getByLabelText('Количество «Тестовый товар»')).toHaveValue(2);
    expect(screen.getByRole('status')).toHaveTextContent('Количество «Тестовый товар»: 2 шт.');

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Уменьшить количество «Тестовый товар»',
      }),
    );
    expect(screen.getByLabelText('Количество «Тестовый товар»')).toHaveValue(1);
  });

  it('supports arrow keys and normalizes manual input on Enter', () => {
    render(<QuantityHarness />);

    const input = screen.getByLabelText('Количество «Тестовый товар»');

    input.focus();
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(input).toHaveValue(2);

    fireEvent.change(input, { target: { value: '2.6' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(input).toHaveValue(3);
    expect(
      screen.getByRole('button', {
        name: 'Увеличить количество «Тестовый товар»',
      }),
    ).toBeDisabled();
  });
});
