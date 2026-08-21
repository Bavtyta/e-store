import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router';

import { useCartStore } from '@/entities/cart';
import { CategoryPage } from '@/pages/category';
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

function renderCategoryPage(path: string) {
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
          <Route element={<CategoryPage />} path="/catalog/*" />
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

describe('CategoryPage integration', () => {
  it('renders entity metadata and the category content', async () => {
    renderCategoryPage('/catalog/truby/pnd');

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'ПНД',
      }),
    ).toBeInTheDocument();
    expect(await screen.findByRole('link', { name: 'Трубы' })).toHaveAttribute(
      'href',
      '/catalog/truby',
    );
    expect(document.title).toBe('ПНД — BELT');
    expect(document.head.querySelector('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'http://localhost:4173/catalog/truby/pnd',
    );
    expect(document.head.querySelector('meta[name="robots"]')).toHaveAttribute(
      'content',
      'index, follow',
    );
  });

  it('renders a dedicated non-indexable 404 state', async () => {
    renderCategoryPage('/catalog/ne-sushchestvuet');

    expect(
      await screen.findByRole('heading', {
        name: 'Категория не найдена',
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Вернуться в каталог' })).toHaveAttribute(
      'href',
      '/catalog',
    );
    expect(document.head.querySelector('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex, nofollow',
    );
  });

  it('shows a safe non-indexable error and supports retry', async () => {
    setScenario('server-error');
    renderCategoryPage('/catalog/truby/pnd');

    expect(
      await screen.findByRole(
        'heading',
        {
          name: 'Не удалось загрузить категорию',
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

    clearScenario();
    fireEvent.click(screen.getByRole('button', { name: 'Повторить' }));

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'ПНД',
      }),
    ).toBeInTheDocument();
  });

  it('marks a category as non-indexable when its product list fails', async () => {
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
    renderCategoryPage('/catalog/truby/pnd');

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
    expect(screen.getByRole('heading', { level: 1, name: 'ПНД' })).toBeInTheDocument();
    expect(document.head.querySelector('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex, nofollow',
    );
  });
});
