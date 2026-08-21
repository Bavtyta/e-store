import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router';

import { useCartStore } from '@/entities/cart';
import { CatalogPage } from '@/pages/catalog';
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

function renderCatalogPage(path = '/catalog') {
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
        <CatalogPage />
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

describe('CatalogPage integration', () => {
  it('announces a successful result count', async () => {
    renderCatalogPage();

    expect(await screen.findByText(/Найдено товаров: \d+/)).toHaveAttribute('aria-live', 'polite');
    expect(document.title).toBe('Каталог строительных материалов — BELT');
  });

  it('shows an accessible empty search state and resets the query', async () => {
    setScenario('empty');
    renderCatalogPage('/catalog?search=несуществующий');

    expect(
      await screen.findByRole('heading', {
        name: 'Ничего не найдено',
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByRole('searchbox', { name: 'Поиск товаров' })).toHaveValue('несуществующий');

    fireEvent.click(screen.getByRole('button', { name: 'Сбросить поиск и фильтры' }));

    expect(screen.getByRole('searchbox', { name: 'Поиск товаров' })).toHaveValue('');
    expect(
      await screen.findByRole('heading', {
        name: 'Ничего не найдено',
      }),
    ).toBeInTheDocument();
  });

  it('shows safe retryable errors without exposing API details', async () => {
    server.use(
      http.get('/api/v1/catalog/products', () =>
        HttpResponse.json(
          {
            error: {
              code: 'INTERNAL_ERROR',
              details: null,
              message: 'Внутренняя ошибка сервера.',
              requestId: null,
            },
          },
          { status: 500 },
        ),
      ),
    );
    renderCatalogPage();

    expect(
      await screen.findByRole(
        'heading',
        {
          name: 'Не удалось загрузить товары',
        },
        {
          timeout: 6_000,
        },
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText('Внутренняя ошибка сервера.')).not.toBeInTheDocument();
    expect(document.head.querySelector('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex, nofollow',
    );
  });

  it('applies live filters to the result list and resets them', async () => {
    renderCatalogPage();

    expect(await screen.findByText(/Найдено товаров: \d+/)).toBeInTheDocument();

    fireEvent.change(screen.getByRole('combobox', { name: 'Материал' }), {
      target: { value: 'ПВХ' },
    });
    fireEvent.click(screen.getByRole('checkbox', { name: '110' }));

    await waitFor(() => {
      expect(screen.getByText('Труба ПВХ канализационная 110 мм')).toBeInTheDocument();
    });
    expect(screen.getByRole('combobox', { name: 'Материал' })).toHaveValue('ПВХ');
    expect(screen.getByRole('checkbox', { name: '110' })).toBeChecked();
    expect(
      screen.queryByRole('link', { name: 'Открыть товар «Труба ПНД PE100 питьевая»' }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Сбросить фильтры' }));

    expect(await screen.findByText('Труба ПНД PE100 питьевая')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: '110' })).not.toBeChecked();
    expect(screen.getByRole('combobox', { name: 'Материал' })).toHaveValue('');
  });

  it('adds a product directly to the cart from its card', async () => {
    renderCatalogPage();

    expect(await screen.findByText('Труба ПНД PE100 питьевая')).toBeInTheDocument();

    const addButton = screen.getAllByRole('button', { name: 'В корзину' })[0];
    if (!addButton) throw new Error('Кнопка "В корзину" не найдена');

    fireEvent.click(addButton);

    await waitFor(() => {
      expect(useCartStore.getState().items).toHaveLength(1);
    });
    expect(useCartStore.getState().items[0]).toEqual(
      expect.objectContaining({
        quantity: '1',
        variantId: 'product-001-variant-20',
      }),
    );
  });
});
