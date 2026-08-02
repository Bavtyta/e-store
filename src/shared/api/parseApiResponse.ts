import { AppError } from './AppError';

interface SuccessfulParseResult<T> {
  data: T;
  success: true;
}

interface FailedParseResult {
  error: unknown;
  success: false;
}

type ParseResult<T> = FailedParseResult | SuccessfulParseResult<T>;

export function parseApiResponse<T>(dto: unknown, mapper: (value: unknown) => ParseResult<T>): T {
  const result = mapper(dto);

  if (result.success) {
    return result.data;
  }

  throw new AppError('Сервис вернул данные в неподдерживаемом формате.', {
    cause: result.error,
    code: null,
    isRetryable: false,
    kind: 'unknown',
    requestId: null,
    status: undefined,
  });
}
