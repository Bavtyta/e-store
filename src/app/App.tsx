import { QueryClientProvider } from '@tanstack/react-query';
import type { QueryClient } from '@tanstack/react-query';
import { RouterProvider } from 'react-router';
import type { RouterProviderProps } from 'react-router';

import { AnalyticsProvider } from '@/shared/lib';
import type { AnalyticsReporter } from '@/shared/lib';

import { ErrorBoundary } from './error-boundary';

interface AppProps {
  analytics: AnalyticsReporter;
  queryClient: QueryClient;
  router: RouterProviderProps['router'];
}

export function App({ analytics, queryClient, router }: AppProps) {
  return (
    <ErrorBoundary>
      <AnalyticsProvider reporter={analytics}>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </AnalyticsProvider>
    </ErrorBoundary>
  );
}
