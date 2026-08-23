import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { MemoryRouter, useLocation } from 'react-router';

import { apiClient } from '@/shared/api';
import { AnalyticsProvider } from '@/shared/lib';
import type { AnalyticsReporter } from '@/shared/lib';
import { HeaderSearch } from '@/widgets/header';

import { handlers } from './handlers';

const server = setupServer(...handlers);
let queryClient: QueryClient;

const noOpAnalyticsReporter: AnalyticsReporter = {
  trackEvent: () => undefined,
};

function LocationProbe() {
  const location = useLocation();

  return <output data-testid="location">{`${location.pathname}${location.search}`}</output>;
}

function renderSearch(reporter: AnalyticsReporter = noOpAnalyticsReporter) {
  queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AnalyticsProvider reporter={reporter}>
        <MemoryRouter>
          <HeaderSearch />
          <LocationProbe />
        </MemoryRouter>
      </AnalyticsProvider>
    </QueryClientProvider>,
  );
}

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  apiClient.defaults.headers.common['x-msw-scenario'] = undefined;
  queryClient.clear();
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

describe('HeaderSearch overlay', () => {
  it('opens with initial categories and focuses the labelled field', async () => {
    renderSearch();

    fireEvent.click(screen.getByRole('searchbox', { name: 'Поиск по каталогу' }));

    const dialog = screen.getByRole('dialog', { name: 'Поиск по каталогу' });
    const input = screen.getByRole('searchbox', { name: 'Поиск по каталогу' });

    expect(screen.getAllByRole('searchbox')).toHaveLength(1);

    expect(dialog).toBeInTheDocument();
    await waitFor(() => {
      expect(input).toHaveFocus();
    });
    expect(await screen.findByText('Трубы')).toBeInTheDocument();
    expect(screen.queryByText('Ищем товары…')).not.toBeInTheDocument();
  });

  it('debounces input and renders products from the existing catalog API', async () => {
    renderSearch();
    fireEvent.click(screen.getByRole('searchbox', { name: 'Поиск по каталогу' }));

    const input = screen.getByRole('searchbox', { name: 'Поиск по каталогу' });
    fireEvent.change(input, { target: { value: 'P' } });
    fireEvent.change(input, { target: { value: 'PE' } });
    fireEvent.change(input, { target: { value: 'PE100' } });

    expect(await screen.findByText('Труба ПНД PE100 питьевая')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Показать все результаты' })).toBeInTheDocument();
  });

  it('keeps an explicit from-price for a single-variant product', async () => {
    renderSearch();
    fireEvent.click(screen.getByRole('searchbox', { name: 'Поиск по каталогу' }));

    fireEvent.change(screen.getByRole('searchbox', { name: 'Поиск по каталогу' }), {
      target: { value: 'Ножницы' },
    });

    expect(await screen.findByText('Ножницы для полимерных труб')).toBeInTheDocument();
    expect(screen.getByText(/от 1\s?290,00/)).toBeInTheDocument();
  });

  it('turns recognizable specifications into filters and tracks a privacy-safe submit', async () => {
    const trackEvent = vi.fn<AnalyticsReporter['trackEvent']>();
    renderSearch({ trackEvent });

    const input = screen.getByRole('searchbox', { name: 'Поиск по каталогу' });
    fireEvent.click(input);
    fireEvent.change(input, { target: { value: 'ПВХ 110 мм' } });

    expect(await screen.findByText('Труба ПВХ канализационная 110 мм')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Найти' }));

    await waitFor(() => {
      const currentLocation = screen.getByTestId('location').textContent;
      const url = new URL(currentLocation, 'http://localhost');

      expect(url.pathname).toBe('/catalog');
      expect(url.searchParams.get('search')).toBeNull();
      expect(url.searchParams.get('filter[diameter]')).toBe('110');
      expect(url.searchParams.get('filter[material]')).toBe('ПВХ');
    });
    expect(trackEvent).toHaveBeenCalledWith({
      name: 'catalog_search_submitted',
      properties: {
        category_id: 'all',
        query_length: 10,
        recognized_filter_count: 2,
        surface: 'catalog',
      },
    });
  });

  it('shows empty and retryable error states', async () => {
    const { unmount } = renderSearch();
    fireEvent.click(screen.getByRole('searchbox', { name: 'Поиск по каталогу' }));
    fireEvent.change(screen.getByRole('searchbox', { name: 'Поиск по каталогу' }), {
      target: { value: 'несуществующий товар' },
    });

    expect(await screen.findByText(/ничего не найдено/i)).toBeInTheDocument();
    unmount();
    queryClient.clear();

    apiClient.defaults.headers.common['x-msw-scenario'] = 'server-error';
    renderSearch();
    fireEvent.click(screen.getByRole('searchbox', { name: 'Поиск по каталогу' }));
    fireEvent.change(screen.getByRole('searchbox', { name: 'Поиск по каталогу' }), {
      target: { value: 'труба' },
    });

    expect(await screen.findByRole('alert', undefined, { timeout: 6_000 })).toHaveTextContent(
      'Не удалось выполнить поиск.',
    );
    expect(screen.getByRole('button', { name: 'Повторить' })).toBeInTheDocument();
  });
});
