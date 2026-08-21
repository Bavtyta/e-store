import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import type { ProductListItem } from '../model/product';
import { ProductCard } from './ProductCard';

const product: ProductListItem = {
  addToCartTarget: {
    id: 'product-1-variant-default',
    maxOrderQuantity: null,
    minOrderQuantity: '1',
    quantityStep: '1',
  },
  availability: { message: 'Под заказ', status: 'on_order' },
  badges: ['Новинка'],
  categoryId: 'category-pipes',
  id: 'product-1',
  name: 'Труба для проверки карточки',
  priceFrom: null,
  priceTo: null,
  primaryUnit: { code: 'meter', label: 'метр' },
  shortAttributes: [
    { code: 'diameter', group: null, name: 'Диаметр', sortOrder: 1, unit: 'мм', value: 25 },
  ],
  slug: 'test-pipe',
  thumbnail: null,
};

describe('ProductCard', () => {
  it('renders a safe image fallback and an on-request price', () => {
    render(
      <MemoryRouter>
        <ProductCard product={product} />
      </MemoryRouter>,
    );

    expect(screen.getByText('Цена по запросу')).toBeInTheDocument();
    expect(screen.getByText('Под заказ')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /открыть товар/i })).toHaveAttribute(
      'href',
      '/product/test-pipe',
    );
  });
});
