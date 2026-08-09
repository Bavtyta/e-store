import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

import { createAppQueryClient } from './providers';
import { QueryClientProvider } from '@tanstack/react-query';

import { HomePage } from '@/pages/home';

describe('application smoke test', () => {
  it('renders the home page', () => {
    const queryClient = createAppQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Строительные материалы для профессионалов',
      }),
    ).toBeInTheDocument();
  });
});
