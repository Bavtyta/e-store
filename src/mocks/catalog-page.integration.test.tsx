import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router';
import { vi } from 'vitest';

import { useCartStore } from '@/entities/cart';
import { getProducts } from '@/entities/product';
import { CatalogFilterPanel, emptyCatalogFilterState } from '@/features/catalog-filter';
import type { CatalogFacetSelections } from '@/features/catalog-filter';
import { CatalogPage } from '@/pages/catalog';
import { apiClient } from '@/shared/api';
import { AnalyticsProvider } from '@/shared/lib';
import type { AnalyticsReporter } from '@/shared/lib';

import { handlers } from './handlers';
import { MSW_SCENARIO_HEADER } from './scenarios';
import type { MockScenario } from './scenarios';

const server = setupServer(...handlers);
let activeQueryClient: QueryClient | null = null;
const trackEvent = vi.fn<AnalyticsReporter['trackEvent']>();

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
    <AnalyticsProvider reporter={{ trackEvent }}>
      <QueryClientProvider client={activeQueryClient}>
        <MemoryRouter initialEntries={[path]}>
          <CatalogPage />
        </MemoryRouter>
      </QueryClientProvider>
    </AnalyticsProvider>,
  );
}

function ControlledCatalogFilterPanel({
  facets,
  onFacetChange,
}: {
  facets: NonNullable<Awaited<ReturnType<typeof getProducts>>['facets']>;
  onFacetChange: (code: string, values: readonly string[]) => void;
}) {
  const [facetSelections, setFacetSelections] = useState<CatalogFacetSelections>({});

  return (
    <CatalogFilterPanel
      facetSelections={facetSelections}
      facets={facets}
      onFacetChange={(code, values) => {
        setFacetSelections((current) => ({ ...current, [code]: values }));
        onFacetChange(code, values);
      }}
      onFiltersChange={() => undefined}
      onReset={() => undefined}
      state={emptyCatalogFilterState}
    />
  );
}

beforeAll(() => {
  server.listen({
    onUnhandledRequest: 'error',
  });
});

beforeEach(() => {
  trackEvent.mockClear();
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
    expect(screen.getByRole('heading', { level: 2, name: 'Товары каталога' })).toBeInTheDocument();
    expect(screen.queryByRole('searchbox', { name: 'Поиск товаров' })).not.toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Хлебные крошки' })).not.toBeInTheDocument();
    expect(document.title).toBe('Каталог строительных материалов — BELT');
  });

  it('shows an accessible empty search state and resets the query', async () => {
    setScenario('empty');
    renderCatalogPage('/catalog?search=несуществующий');

    expect(
      await screen.findByRole('heading', {
        name: 'По запросу ничего не найдено',
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
    expect(screen.queryByRole('combobox', { name: 'Сортировка' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Очистить поиск' }));

    expect(
      await screen.findByRole('heading', {
        name: 'В каталоге пока нет товаров',
      }),
    ).toBeInTheDocument();
  });

  it('recovers from a combined empty state without silently clearing both inputs', async () => {
    setScenario('empty');
    renderCatalogPage('/catalog?search=труба&filter%5Bmaterial%5D=ПВХ');

    expect(
      await screen.findByRole('heading', {
        name: 'По запросу с выбранными фильтрами ничего нет',
      }),
    ).toBeInTheDocument();

    fireEvent.click(
      within(screen.getByRole('status')).getByRole('button', { name: 'Сбросить фильтры' }),
    );

    expect(
      await screen.findByRole('heading', { name: 'По запросу ничего не найдено' }),
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

    fireEvent.click(screen.getByRole('checkbox', { name: /^ПВХ, товаров:/ }));
    fireEvent.click(screen.getByRole('checkbox', { name: /^110, товаров:/ }));

    await waitFor(() => {
      expect(screen.getByText('Труба ПВХ канализационная 110 мм')).toBeInTheDocument();
    });
    expect(screen.getByRole('checkbox', { name: /^ПВХ, товаров:/ })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: /^110, товаров:/ })).toBeChecked();
    fireEvent.click(screen.getByRole('button', { name: 'Убрать фильтр: Материал: ПВХ' }));
    await waitFor(() => {
      expect(screen.getByRole('checkbox', { name: /^ПВХ, товаров:/ })).not.toBeChecked();
    });
    expect(screen.getByRole('checkbox', { name: /^110, товаров:/ })).toBeChecked();
    expect(
      screen.queryByRole('link', { name: 'Открыть товар «Труба ПНД PE100 питьевая»' }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Сбросить все' }));

    expect(await screen.findByText('Труба ПНД PE100 питьевая')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /^110, товаров:/ })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: /^ПВХ, товаров:/ })).not.toBeChecked();
  });

  it('renders and applies dynamic facets without changing legacy filters', async () => {
    setScenario('facets');
    const response = await getProducts();

    const facets = response.facets;

    expect(facets?.some((facet) => facet.code === 'application')).toBe(true);
    if (facets === undefined) throw new Error('Ожидались facets в mock-ответе');

    const onFacetChange = vi.fn();
    render(<ControlledCatalogFilterPanel facets={facets} onFacetChange={onFacetChange} />);

    expect(screen.getByRole('heading', { level: 2, name: 'Фильтры' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Питьевая вода, товаров: 1' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Назначение' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('checkbox', { name: 'Питьевая вода, товаров: 1' }));

    expect(screen.getByRole('checkbox', { name: 'Питьевая вода, товаров: 1' })).toBeChecked();
    expect(onFacetChange).toHaveBeenCalledWith('application', ['Питьевая вода']);
  });

  it('reports a privacy-safe zero-result view and its recovery action', async () => {
    setScenario('empty');
    renderCatalogPage('/catalog?search=секретный-запрос');

    expect(
      await screen.findByRole('heading', { name: 'По запросу ничего не найдено' }),
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(trackEvent.mock.calls.some(([event]) => event.name === 'catalog_results_viewed')).toBe(
        true,
      );
    });
    const resultsEvent = trackEvent.mock.calls
      .map(([event]) => event)
      .find((event) => event.name === 'catalog_results_viewed');
    expect(resultsEvent?.properties).toMatchObject({
      empty_reason: 'search',
      query_length: 16,
      result_count: 0,
      surface: 'catalog',
    });
    expect(JSON.stringify(trackEvent.mock.calls)).not.toContain('секретный-запрос');

    fireEvent.click(screen.getByRole('button', { name: 'Очистить поиск' }));

    const recoveryEvent = trackEvent.mock.calls
      .map(([event]) => event)
      .find((event) => event.name === 'catalog_recovery_selected');
    expect(recoveryEvent?.properties).toMatchObject({
      action: 'clear_search',
      empty_reason: 'search',
    });
  });

  it('associates dynamic facet labels with the correct filter panel instance', async () => {
    setScenario('facets');
    const response = await getProducts();
    const facets = response.facets;

    if (facets === undefined) throw new Error('Ожидались facets в mock-ответе');

    render(
      <>
        <ControlledCatalogFilterPanel facets={facets} onFacetChange={() => undefined} />
        <ControlledCatalogFilterPanel facets={facets} onFacetChange={() => undefined} />
      </>,
    );

    const checkboxes = screen.getAllByRole('checkbox', {
      name: 'Питьевая вода, товаров: 1',
    });
    const firstCheckbox = checkboxes[0];
    const secondCheckbox = checkboxes[1];

    if (firstCheckbox === undefined || secondCheckbox === undefined) {
      throw new Error('Ожидались два экземпляра динамического фильтра');
    }

    expect(firstCheckbox.id).not.toBe(secondCheckbox.id);

    const secondLabel = document.querySelector<HTMLLabelElement>(
      `label[for="${secondCheckbox.id}"]`,
    );
    if (secondLabel === null) throw new Error('Не найдена подпись второго фильтра');

    fireEvent.click(secondLabel);

    expect(firstCheckbox).not.toBeChecked();
    expect(secondCheckbox).toBeChecked();
  });

  it('keeps a dynamic facet synchronized when its summary chip is removed', async () => {
    setScenario('facets');
    renderCatalogPage('/catalog?filter[application]=Питьевая%20вода');

    const checkbox = await screen.findByRole('checkbox', {
      name: 'Питьевая вода, товаров: 1',
    });
    expect(checkbox).toBeChecked();

    fireEvent.click(
      screen.getByRole('button', { name: 'Убрать фильтр: Назначение: Питьевая вода' }),
    );

    await waitFor(() => {
      expect(checkbox).not.toBeChecked();
    });
  });

  it('applies mobile filter drafts only from the dialog footer', async () => {
    renderCatalogPage();

    expect(await screen.findByText('Труба ПНД PE100 питьевая')).toBeInTheDocument();
    trackEvent.mockClear();
    fireEvent.click(screen.getByRole('button', { name: 'Фильтры и сортировка' }));

    const dialog = screen.getByRole('dialog', { name: 'Фильтры и сортировка' });
    const filtersHeading = within(dialog).getByRole('heading', { level: 3, name: 'Фильтры' });
    const categoriesHeading = within(dialog).getByRole('heading', {
      level: 3,
      name: 'Категории',
    });
    expect(
      filtersHeading.compareDocumentPosition(categoriesHeading) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).not.toBe(0);
    fireEvent.click(within(dialog).getByRole('checkbox', { name: /^ПВХ, товаров:/ }));

    expect(screen.getByText('Труба ПНД PE100 питьевая')).toBeInTheDocument();
    expect(trackEvent.mock.calls.some(([event]) => event.name.startsWith('catalog_filter_'))).toBe(
      false,
    );

    const applyButton = within(dialog).getByRole('button', { name: /^Показать/ });
    await waitFor(() => {
      expect(applyButton).not.toBeDisabled();
      expect(applyButton).toHaveTextContent(/Показать \d+$/);
    });
    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(screen.queryByText('Труба ПНД PE100 питьевая')).not.toBeInTheDocument();
    });
    expect(screen.getByRole('checkbox', { name: /^ПВХ, товаров:/ })).toBeChecked();
    expect(
      trackEvent.mock.calls.some(
        ([event]) =>
          event.name === 'catalog_filter_applied' &&
          event.properties.interaction === 'mobile_drawer',
      ),
    ).toBe(true);
  });

  it('discards a closed mobile draft without reporting filter changes', async () => {
    renderCatalogPage();

    expect(await screen.findByText('Труба ПНД PE100 питьевая')).toBeInTheDocument();
    trackEvent.mockClear();
    fireEvent.click(screen.getByRole('button', { name: 'Фильтры и сортировка' }));

    const dialog = screen.getByRole('dialog', { name: 'Фильтры и сортировка' });
    fireEvent.click(within(dialog).getByRole('checkbox', { name: /^ПВХ, товаров:/ }));
    fireEvent.click(within(dialog).getByRole('button', { name: 'Закрыть фильтры' }));

    expect(screen.getByText('Труба ПНД PE100 питьевая')).toBeInTheDocument();
    expect(trackEvent.mock.calls.some(([event]) => event.name.startsWith('catalog_filter_'))).toBe(
      false,
    );
  });

  it('clears one filter group and validates an inverted price range', async () => {
    renderCatalogPage();

    expect(await screen.findByText(/Найдено товаров: \d+/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('checkbox', { name: /^ПВХ, товаров:/ }));

    const clearMaterial = await screen.findByRole('button', {
      name: 'Очистить группу «Материал»',
    });
    fireEvent.click(clearMaterial);
    await waitFor(() => {
      expect(screen.getByRole('checkbox', { name: /^ПВХ, товаров:/ })).not.toBeChecked();
    });

    fireEvent.change(screen.getByRole('spinbutton', { name: 'Цена от, руб' }), {
      target: { value: '1000' },
    });
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Цена до, руб' }), {
      target: { value: '500' },
    });

    expect(screen.getByRole('alert')).toHaveTextContent('Цена «от» не должна быть выше цены «до».');
    expect(screen.getByRole('spinbutton', { name: 'Цена от, руб' })).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });

  it('adds a product directly to the cart from its card', async () => {
    renderCatalogPage();

    const multiVariantHeading = await screen.findByRole('heading', {
      name: 'Труба ПНД PE100 питьевая',
    });
    const multiVariantCardContent = multiVariantHeading.parentElement?.parentElement ?? null;

    if (multiVariantCardContent === null) {
      throw new Error('Контент карточки многовариантного товара не найден');
    }

    expect(
      within(multiVariantCardContent).getByRole('link', { name: 'Выбрать вариант' }),
    ).toHaveAttribute('href', '/product/truba-pnd-pe100-pitevaya');
    expect(useCartStore.getState().items).toEqual([]);
    trackEvent.mockClear();
    fireEvent.click(
      within(multiVariantCardContent).getByRole('link', { name: 'Выбрать вариант' }),
      { ctrlKey: true },
    );
    expect(
      trackEvent.mock.calls.some(
        ([event]) =>
          event.name === 'catalog_variant_selection_requested' &&
          event.properties.product_id === 'product-001' &&
          event.properties.variant_count === 3,
      ),
    ).toBe(true);

    const directProductHeading = screen.getByRole('heading', {
      name: 'Труба ПВХ канализационная 110 мм',
    });
    const directProductCardContent = directProductHeading.parentElement?.parentElement ?? null;

    if (directProductCardContent === null) {
      throw new Error('Контент карточки товара для прямой покупки не найден');
    }

    fireEvent.click(within(directProductCardContent).getByRole('button', { name: 'В корзину' }));

    await waitFor(() => {
      expect(useCartStore.getState().items).toHaveLength(1);
    });
    expect(useCartStore.getState().items[0]).toEqual(
      expect.objectContaining({
        quantity: '1',
        variantId: 'product-002-variant-110',
      }),
    );
    expect(
      trackEvent.mock.calls.some(
        ([event]) =>
          event.name === 'catalog_add_to_cart' &&
          event.properties.product_id === 'product-002' &&
          event.properties.position === 2,
      ),
    ).toBe(true);
  });
});
