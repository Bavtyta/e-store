import { QueryClientProvider } from '@tanstack/react-query';
import type { QueryClient } from '@tanstack/react-query';
import { RouterProvider } from 'react-router';
import type { RouterProviderProps } from 'react-router';

import { ErrorBoundary } from './error-boundary';

interface AppProps {
  queryClient: QueryClient;
  router: RouterProviderProps['router'];
}

export function App({ queryClient, router }: AppProps) {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
