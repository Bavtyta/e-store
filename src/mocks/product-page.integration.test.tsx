import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router';

import { useCartStore } from '@/entities/cart';
import { ProductPage } from '@/pages/product';
import { apiClient } from '@/shared/api';

import { handlers } from './handlers';
import { MSW_SCENARIO_HEADER } from './scenarios';
import type { MockScenario } from './scenarios';

const server = setupServer(...handlers);
let activeQueryClient: QueryClient | null = null;

function setScenario(scenario: MockScenario): void {
  apiClient.defaults.headers.common[MSW_SCENARIO_HEADER] = scenario;
}

function clearScenario(): void {
  apiClient.defaults.headers.common[MSW_SCENARIO_HEADER] = undefined;
}

function renderProductPage(path: string) {
  activeQueryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retryDelay: 0,
      },
    },
  });

  return render(
    <QueryClientProvider client={activeQueryClient}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route element={<ProductPage />} path="/product/:productSlug" />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeAll(() => {
  server.listen({
    onUnhandledRequest: 'error',
  });
});

beforeEach(() => {
  useCartStore.setState({
    hasHydrated: true,
    items: [],
  });
  useCartStore.persist.clearStorage();
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

describe('ProductPage integration', () => {
  it('shows a loading skeleton and then renders a product', async () => {
    setScenario('delay');

    renderProductPage('/product/truba-pnd-pe100-pitevaya');

    expect(screen.getByLabelText('Загрузка страницы товара')).toBeInTheDocument();
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Труба ПНД PE100 питьевая',
      }),
    ).toBeInTheDocument();
  });

  it('renders a dedicated not-found state for a missing product', async () => {
    renderProductPage('/product/ne-sushchestvuet');

    expect(
      await screen.findByRole('heading', {
        name: 'Товар не найден',
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Вернуться в каталог' })).toHaveAttribute(
      'href',
      '/catalog',
    );
  });

  it('renders a safe error and retries the request', async () => {
    setScenario('server-error');

    renderProductPage('/product/truba-pnd-pe100-pitevaya');

    expect(
      await screen.findByRole('heading', {
        name: 'Не удалось загрузить товар',
      }),
    ).toBeInTheDocument();

    clearScenario();
    fireEvent.click(screen.getByRole('button', { name: 'Повторить' }));

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Труба ПНД PE100 питьевая',
      }),
    ).toBeInTheDocument();
  });

  it('uses an accessible placeholder when the product has no images', async () => {
    renderProductPage('/product/perehodnik-pvh-50-40');

    await screen.findByRole('heading', {
      level: 1,
      name: 'Переходник ПВХ 50 × 40 мм',
    });

    expect(
      screen.getByRole('img', {
        name: 'Изображение товара «Переходник ПВХ 50 × 40 мм» отсутствует',
      }),
    ).toBeInTheDocument();
  });

  it('updates the SKU, price and main image after selecting another variant', async () => {
    renderProductPage('/product/truba-pnd-pe100-pitevaya');

    await screen.findByRole('heading', {
      level: 1,
      name: 'Труба ПНД PE100 питьевая',
    });

    expect(screen.getByText('SKU-PRODUCT-001-20')).toBeInTheDocument();
    expect(within(screen.getByLabelText('Цена')).getByText(/89,00/)).toBeInTheDocument();
    expect(
      screen.getByRole('img', {
        name: 'Труба ПНД PE100 питьевая, изображение 1',
      }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('radio', { name: '25 мм' }));

    expect(screen.getByText('SKU-PRODUCT-001-25')).toBeInTheDocument();
    expect(within(screen.getByLabelText('Цена')).getByText(/125,00/)).toBeInTheDocument();
    expect(
      screen.getByText(/Выбран вариант «Диаметр 25 мм»\. Артикул SKU-PRODUCT-001-25/),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('img', {
        name: 'Труба ПНД PE100 питьевая, изображение 2',
      }),
    ).toBeInTheDocument();
  });

  it('adds the selected variant and updates the header count without reload', async () => {
    renderProductPage('/product/truba-pnd-pe100-pitevaya');

    await screen.findByRole('heading', {
      level: 1,
      name: 'Труба ПНД PE100 питьевая',
    });
    fireEvent.click(screen.getByRole('radio', { name: '25 мм' }));
    fireEvent.click(screen.getByRole('button', { name: 'В корзину' }));

    expect(useCartStore.getState().items).toEqual([
      expect.objectContaining({
        quantity: '1',
        variantId: 'product-001-variant-25',
      }),
    ]);
    expect(screen.getByText('Товар добавлен в корзину')).toBeInTheDocument();
    expect(screen.getByLabelText('В корзине позиций: 1')).toBeInTheDocument();
  });
});
