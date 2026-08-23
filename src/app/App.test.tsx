import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

import { HomePage } from '@/pages/home';

import { createAppQueryClient } from './providers';

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
        name: 'Трубы, фитинги и РТИ для ремонта и монтажа',
      }),
    ).toBeInTheDocument();
  });
});
