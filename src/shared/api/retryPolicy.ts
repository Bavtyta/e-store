import { mapApiError } from './mapApiError';

const MAX_API_RETRY_COUNT = 2;

export function shouldRetryApiRequest(failureCount: number, error: unknown): boolean {
  const mappedError = mapApiError(error);

  return mappedError.isRetryable && failureCount < MAX_API_RETRY_COUNT;
}
