import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

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
  packagePriceFrom: null,
  packageQuantity: null,
  priceFrom: null,
  priceType: 'on_request',
  priceTo: null,
  primaryUnit: { code: 'meter', label: 'метр' },
  purchaseAction: 'direct',
  shortAttributes: [
    { code: 'diameter', group: null, name: 'Диаметр', sortOrder: 1, unit: 'мм', value: 25 },
  ],
  slug: 'test-pipe',
  thumbnail: null,
  variantCount: 1,
  variantSummary: null,
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
    expect(screen.queryByText(/Минимальный заказ/)).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /открыть товар/i })).toHaveAttribute(
      'href',
      '/product/test-pipe',
    );
  });

  it('keeps an overlay action outside the product link', () => {
    render(
      <MemoryRouter>
        <ProductCard overlayAction={<button type="button">В избранное</button>} product={product} />
      </MemoryRouter>,
    );

    expect(screen.getByRole('button', { name: 'В избранное' }).closest('a')).toBeNull();
  });

  it('reports product opening from both navigational links', () => {
    const onProductOpen = vi.fn();

    render(
      <MemoryRouter>
        <ProductCard onProductOpen={onProductOpen} product={product} />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('link', { name: /открыть товар/i }));
    fireEvent.click(screen.getByRole('link', { name: product.name }));

    expect(onProductOpen).toHaveBeenNthCalledWith(1, { product, trigger: 'image' });
    expect(onProductOpen).toHaveBeenNthCalledWith(2, { product, trigger: 'title' });
  });

  it('explains variant choice and unit price', () => {
    render(
      <MemoryRouter>
        <ProductCard
          product={{
            ...product,
            addToCartTarget: null,
            priceFrom: { amountMinor: 6_500, currency: 'RUB' },
            priceType: 'fixed',
            purchaseAction: 'select_variant',
            variantCount: 3,
            variantSummary: '3 варианта · Диаметр: 20 мм, 25 мм, 32 мм',
          }}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText('3 варианта · Диаметр: 20 мм, 25 мм, 32 мм')).toBeInTheDocument();
    expect(screen.getByText('за 1 метр')).toBeInTheDocument();
    expect(screen.getByText('Цена и наличие зависят от выбранного варианта')).toBeInTheDocument();
  });

  it('makes the actual package purchase price primary and keeps unit math secondary', () => {
    render(
      <MemoryRouter>
        <ProductCard
          product={{
            ...product,
            addToCartTarget: {
              id: 'product-1-variant-default',
              maxOrderQuantity: null,
              minOrderQuantity: '10',
              quantityStep: '10',
            },
            packagePriceFrom: { amountMinor: 65_000, currency: 'RUB' },
            packageQuantity: '10',
            priceFrom: { amountMinor: 6_500, currency: 'RUB' },
            priceType: 'fixed',
          }}
        />
      </MemoryRouter>,
    );

    const priceRegion = screen.getByLabelText('Цена и условия покупки');

    expect(within(priceRegion).getByText(/650,00/)).toBeInTheDocument();
    expect(within(priceRegion).getByText('за упаковку')).toBeInTheDocument();
    expect(
      within(priceRegion).getByText(/В упаковке: 10 метр · 65,00 .* за 1 метр/),
    ).toBeInTheDocument();
  });

  it('uses the neutral availability treatment when stock is unknown', () => {
    render(
      <MemoryRouter>
        <ProductCard
          product={{
            ...product,
            availability: { message: null, status: 'unknown' },
          }}
        />
      </MemoryRouter>,
    );

    const availability = screen.getByText('Наличие уточняется');

    expect(availability).toHaveAttribute('data-status', 'unknown');
    expect(availability.className).toMatch(/neutral/);
  });

  it('renders at most two ordered comparison attributes as a definition list', () => {
    const { container } = render(
      <MemoryRouter>
        <ProductCard
          product={{
            ...product,
            shortAttributes: [
              {
                code: 'third',
                group: null,
                name: 'Третий параметр',
                sortOrder: 30,
                unit: null,
                value: 'не показывать',
              },
              {
                code: 'first',
                group: null,
                name: 'Первый параметр',
                sortOrder: 10,
                unit: 'мм',
                value: 25,
              },
              {
                code: 'second',
                group: null,
                name: 'Второй параметр',
                sortOrder: 20,
                unit: null,
                value: true,
              },
            ],
          }}
        />
      </MemoryRouter>,
    );

    expect(container.querySelectorAll('dl')).toHaveLength(1);
    expect([...container.querySelectorAll('dt')].map((term) => term.textContent)).toEqual([
      'Первый параметр',
      'Второй параметр',
    ]);
    expect(
      [...container.querySelectorAll('dd')].map((definition) => definition.textContent),
    ).toEqual(['25 мм', 'Да']);
    expect(screen.queryByText('Третий параметр')).not.toBeInTheDocument();
  });
});
