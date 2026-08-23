import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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
    packagePriceFrom: null,
    packageQuantity: null,
    priceFrom: {
      amountMinor: 12_500,
      currency: 'RUB',
    },
    priceType: 'fixed',
    priceTo: null,
    primaryUnit: {
      code: 'meter',
      label: 'м',
    },
    purchaseAction: 'direct',
    shortAttributes: [],
    slug: 'test-pipe',
    thumbnail: null,
    variantCount: 1,
    variantSummary: null,
    ...overrides,
  };
}

function renderButton(product: ProductListItem) {
  return render(
    <MemoryRouter>
      <ProductCardAddToCartButton product={product} />
    </MemoryRouter>,
  );
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
    const onAdded = vi.fn();
    render(
      <MemoryRouter>
        <ProductCardAddToCartButton onAdded={onAdded} product={createProduct()} />
      </MemoryRouter>,
    );

    const addButton = screen.getByRole('button', { name: 'В корзину' });

    expect(addButton.className).toMatch(/primary/);
    fireEvent.click(addButton);

    expect(useCartStore.getState().items).toEqual([
      expect.objectContaining({
        quantity: '1',
        variantId: 'product-1-variant-25',
      }),
    ]);
    expect(onAdded).toHaveBeenCalledWith({
      productId: 'product-1',
      quantity: '1',
      variantId: 'product-1-variant-25',
    });
  });

  it('adds a packaged product using the package quantity step', () => {
    renderButton(
      createProduct({
        addToCartTarget: {
          id: 'product-1-variant-package',
          maxOrderQuantity: null,
          minOrderQuantity: '10',
          quantityStep: '10',
        },
        packagePriceFrom: { amountMinor: 65_000, currency: 'RUB' },
        packageQuantity: '10',
      }),
    );

    fireEvent.click(screen.getByRole('button', { name: 'В корзину' }));

    expect(useCartStore.getState().items).toEqual([
      expect.objectContaining({
        quantity: '10',
        variantId: 'product-1-variant-package',
      }),
    ]);
  });

  it('is disabled for out-of-stock products', () => {
    renderButton(
      createProduct({
        addToCartTarget: null,
        availability: {
          message: 'Нет в наличии',
          status: 'out_of_stock',
        },
        purchaseAction: 'unavailable',
      }),
    );

    const unavailableButton = screen.getByRole('button', { name: 'Недоступно' });

    expect(unavailableButton).toBeDisabled();
    expect(unavailableButton.className).toMatch(/secondary/);
  });

  it('fails safely when a malformed direct product has no add-to-cart target', () => {
    renderButton(createProduct({ addToCartTarget: null }));

    expect(screen.getByRole('button', { name: 'Недоступно' })).toBeDisabled();
  });

  it('links to the product page when a variant must be selected', () => {
    const onVariantSelectionRequested = vi.fn();
    render(
      <MemoryRouter>
        <ProductCardAddToCartButton
          onVariantSelectionRequested={onVariantSelectionRequested}
          product={createProduct({
            addToCartTarget: null,
            purchaseAction: 'select_variant',
            variantCount: 3,
            variantSummary: '3 варианта · Диаметр: 20 мм, 25 мм, 32 мм',
          })}
        />
      </MemoryRouter>,
    );

    const selectionLink = screen.getByRole('link', { name: 'Выбрать вариант' });
    expect(selectionLink).toHaveAttribute('href', '/product/test-pipe');
    expect(selectionLink.className).toMatch(/secondary/);
    fireEvent.click(selectionLink);

    expect(onVariantSelectionRequested).toHaveBeenCalledWith({ productId: 'product-1' });
    expect(useCartStore.getState().items).toEqual([]);
  });

  it('links to price clarification instead of adding a direct on-request product', () => {
    const onAdded = vi.fn();

    render(
      <MemoryRouter>
        <ProductCardAddToCartButton
          onAdded={onAdded}
          product={createProduct({
            priceFrom: null,
            priceType: 'on_request',
          })}
        />
      </MemoryRouter>,
    );

    const inquiryLink = screen.getByRole('link', { name: 'Уточнить цену и наличие' });

    expect(inquiryLink).toHaveAttribute('href', '/product/test-pipe');
    expect(inquiryLink.className).toMatch(/secondary/);
    fireEvent.click(inquiryLink);
    expect(onAdded).not.toHaveBeenCalled();
    expect(useCartStore.getState().items).toEqual([]);
  });
});
