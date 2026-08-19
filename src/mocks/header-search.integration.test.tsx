import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router';

import { apiClient } from '@/shared/api';
import { HeaderSearch } from '@/widgets/header';

import { handlers } from './handlers';

const server = setupServer(...handlers);
let queryClient: QueryClient;

function renderSearch() {
  queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <HeaderSearch />
      </MemoryRouter>
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
