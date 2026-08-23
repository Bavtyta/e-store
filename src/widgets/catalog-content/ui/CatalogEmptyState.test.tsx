import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { vi } from 'vitest';

import { CatalogEmptyState } from './CatalogEmptyState';

describe('CatalogEmptyState', () => {
  it('keeps search and filter recovery actions separate', () => {
    const onClearFilters = vi.fn();
    const onClearSearch = vi.fn();
    const onRecoverySelected = vi.fn();

    render(
      <MemoryRouter>
        <CatalogEmptyState
          onClearFilters={onClearFilters}
          onClearSearch={onClearSearch}
          onRecoverySelected={onRecoverySelected}
          reason="search_and_filters"
        />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', {
        name: 'По запросу с выбранными фильтрами ничего нет',
      }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Сбросить фильтры' }));
    expect(onClearFilters).toHaveBeenCalledOnce();
    expect(onClearSearch).not.toHaveBeenCalled();
    expect(onRecoverySelected).toHaveBeenCalledWith('clear_filters');

    fireEvent.click(screen.getByRole('button', { name: 'Очистить поиск' }));
    expect(onClearSearch).toHaveBeenCalledOnce();
    expect(onRecoverySelected).toHaveBeenCalledWith('clear_search');
  });

  it('uses a link for browsing out of an empty category', () => {
    render(
      <MemoryRouter>
        <CatalogEmptyState
          browseTarget={{
            action: 'view_parent_category',
            label: 'Смотреть все трубы',
            to: '/catalog/truby',
          }}
          reason="category"
        />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { name: 'В этой категории пока нет товаров' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Смотреть все трубы' })).toHaveAttribute(
      'href',
      '/catalog/truby',
    );
  });
});
