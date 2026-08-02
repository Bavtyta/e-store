import { render, screen } from '@testing-library/react';
import { createMemoryRouter } from 'react-router';

import { App } from './App';
import { createAppQueryClient } from './providers';
import { appRoutes } from './router/routes';

describe('application smoke test', () => {
  it('starts and renders the requested route', async () => {
    const queryClient = createAppQueryClient();
    const router = createMemoryRouter(appRoutes, {
      initialEntries: ['/'],
    });

    render(<App queryClient={queryClient} router={router} />);

    expect(
      await screen.findByRole('heading', {
        name: 'Материалы для монтажа, ремонта и производства',
      }),
    ).toBeInTheDocument();
  });
});
