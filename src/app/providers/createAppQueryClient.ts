import { QueryClient } from '@tanstack/react-query';

import { shouldRetryApiRequest } from '@/shared/api';

export function createAppQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: shouldRetryApiRequest,
      },
    },
  });
}
