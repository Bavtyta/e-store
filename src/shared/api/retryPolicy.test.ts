import { AppError, shouldRetryApiRequest } from '@/shared/api';

function createAppError(isRetryable: boolean, status: number | undefined): AppError {
  return new AppError('Безопасное сообщение', {
    cause: null,
    code: null,
    isRetryable,
    kind: isRetryable ? 'server' : 'validation',
    requestId: null,
    status,
  });
}

describe('API retry policy', () => {
  it('never retries non-retryable client errors', () => {
    expect(shouldRetryApiRequest(0, createAppError(false, 400))).toBe(false);
    expect(shouldRetryApiRequest(0, createAppError(false, 404))).toBe(false);
    expect(shouldRetryApiRequest(0, createAppError(false, 409))).toBe(false);
    expect(shouldRetryApiRequest(0, createAppError(false, 422))).toBe(false);
  });

  it('limits retries for temporary errors to two attempts', () => {
    const error = createAppError(true, 500);

    expect(shouldRetryApiRequest(0, error)).toBe(true);
    expect(shouldRetryApiRequest(1, error)).toBe(true);
    expect(shouldRetryApiRequest(2, error)).toBe(false);
  });
});
