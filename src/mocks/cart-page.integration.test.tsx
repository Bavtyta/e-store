import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { StrictMode } from 'react';
import { MemoryRouter } from 'react-router';

import { CART_STORAGE_KEY, CART_STORAGE_VERSION, useCartStore } from '@/entities/cart';
import type { CartItem } from '@/entities/cart';
import { CartPage } from '@/pages/cart';
import { apiClient } from '@/shared/api';

import { handlers } from './handlers';
import { MSW_SCENARIO_HEADER } from './scenarios';
import type { MockScenario } from './scenarios';

const ADDED_AT = '2026-07-30T12:00:00.000Z';
const ACTIVE_VARIANT_ID = 'product-001-variant-25';
const MISSING_VARIANT_ID = 'variant-removed-from-catalog';
const server = setupServer(...handlers);
let activeQueryClient: QueryClient | null = null;

function setScenario(scenario: MockScenario): void {
  apiClient.defaults.headers.common[MSW_SCENARIO_HEADER] = scenario;
}

function clearScenario(): void {
  apiClient.defaults.headers.common[MSW_SCENARIO_HEADER] = undefined;
}

async function restoreCart(items: readonly CartItem[]): Promise<void> {
  useCartStore.setState({
    hasHydrated: false,
    items: [],
  });
  useCartStore.persist.clearStorage();
  localStorage.setItem(
    CART_STORAGE_KEY,
    JSON.stringify({
      state: {
        items,
      },
      version: CART_STORAGE_VERSION,
    }),
  );

  await useCartStore.persist.rehydrate();
  useCartStore.setState({ hasHydrated: true });
}

function createSavedItem(variantId: string): CartItem {
  return {
    addedAt: ADDED_AT,
    quantity: '1',
    variantId,
  };
}

function renderCartPage() {
  activeQueryClient = new QueryClient({
    defaultOptions: {
      mutations: {
        retryDelay: 0,
      },
      queries: {
        retryDelay: 0,
      },
    },
  });

  return render(
    <StrictMode>
      <QueryClientProvider client={activeQueryClient}>
        <MemoryRouter initialEntries={['/cart']}>
          <CartPage />
        </MemoryRouter>
      </QueryClientProvider>
    </StrictMode>,
  );
}

beforeAll(() => {
  server.listen({
    onUnhandledRequest: 'error',
  });
});

afterEach(() => {
  activeQueryClient?.clear();
  activeQueryClient = null;
  clearScenario();
  server.resetHandlers();
  useCartStore.setState({
    hasHydrated: false,
    items: [],
  });
  useCartStore.persist.clearStorage();
});

afterAll(() => {
  server.close();
});

describe('CartPage integration', () => {
  it('restores stable local data and resolves current product information', async () => {
    await restoreCart([createSavedItem(ACTIVE_VARIANT_ID)]);

    renderCartPage();

    expect(
      await screen.findByRole('heading', {
        level: 2,
        name: 'Труба ПНД PE100 питьевая',
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('SKU-PRODUCT-001-25')).toBeInTheDocument();
    expect(screen.getByLabelText('Количество «Труба ПНД PE100 питьевая»')).toHaveValue(1);
    expect(screen.getByText('Корзина актуализирована. Позиций: 1.')).toHaveAttribute(
      'aria-live',
      'polite',
    );

    const summary = screen.getByRole('heading', { name: 'Итоги корзины' }).parentElement;

    expect(summary).not.toBeNull();
    expect(within(summary ?? document.body).getAllByText(/125,00/).length).toBeGreaterThan(0);
  });

  it('keeps a missing variant visible until the user removes it', async () => {
    await restoreCart([createSavedItem(MISSING_VARIANT_ID)]);

    renderCartPage();

    expect(await screen.findByText(/больше не найден или снят с продажи/i)).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', {
        name: `Удалить «Вариант ${MISSING_VARIANT_ID}» из корзины`,
      }),
    );

    expect(await screen.findByRole('heading', { name: 'Корзина пуста' })).toBeInTheDocument();
  });

  it('preserves saved lines on a resolve error and supports retry', async () => {
    await restoreCart([createSavedItem(ACTIVE_VARIANT_ID)]);
    setScenario('server-error');

    renderCartPage();

    expect(
      await screen.findByRole(
        'heading',
        {
          name: 'Не удалось актуализировать корзину',
        },
        {
          timeout: 6_000,
        },
      ),
    ).toBeInTheDocument();
    expect(useCartStore.getState().items).toHaveLength(1);

    clearScenario();
    fireEvent.click(screen.getByRole('button', { name: 'Повторить' }));

    expect(
      await screen.findByRole('heading', {
        name: 'Труба ПНД PE100 питьевая',
      }),
    ).toBeInTheDocument();
  });

  it('shows an unavailable resolved variant and excludes it from total', async () => {
    await restoreCart([createSavedItem(ACTIVE_VARIANT_ID)]);
    setScenario('changed-availability');

    renderCartPage();

    expect(await screen.findByText(/Вариант стал недоступен/i)).toBeInTheDocument();
    expect(
      screen.queryByLabelText('Количество «Труба ПНД PE100 питьевая»'),
    ).not.toBeInTheDocument();

    const summary = screen.getByRole('heading', { name: 'Итоги корзины' }).parentElement;

    expect(summary).not.toBeNull();
    expect(within(summary ?? document.body).getAllByText('0,00 ₽').length).toBeGreaterThan(0);
  });

  it('clears the cart only after confirmation', async () => {
    await restoreCart([createSavedItem(ACTIVE_VARIANT_ID)]);

    renderCartPage();

    await screen.findByRole('heading', {
      name: 'Труба ПНД PE100 питьевая',
    });
    fireEvent.click(screen.getByRole('button', { name: 'Очистить корзину' }));

    expect(screen.getByRole('dialog', { name: 'Очистить корзину?' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Очистить' }));

    expect(await screen.findByRole('heading', { name: 'Корзина пуста' })).toBeInTheDocument();
    expect(useCartStore.getState().items).toEqual([]);
  });
});
