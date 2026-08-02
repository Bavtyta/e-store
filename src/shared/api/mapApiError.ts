import axios from 'axios';

import { AppError } from './AppError';
import type { AppErrorKind } from './AppError';
import { apiErrorEnvelopeSchema } from './contracts';

interface ErrorMetadata {
  code: string | null;
  requestId: string | null;
}

interface ErrorPresentation {
  isRetryable: boolean;
  kind: AppErrorKind;
  message: string;
}

const EMPTY_ERROR_METADATA: ErrorMetadata = {
  code: null,
  requestId: null,
};

function getErrorMetadata(data: unknown): ErrorMetadata {
  const result = apiErrorEnvelopeSchema.safeParse(data);

  if (!result.success) {
    return EMPTY_ERROR_METADATA;
  }

  return {
    code: result.data.error.code,
    requestId: result.data.error.requestId,
  };
}

function getErrorPresentation(status: number): ErrorPresentation {
  switch (status) {
    case 400:
    case 422:
      return {
        isRetryable: false,
        kind: 'validation',
        message: 'Проверьте введённые данные и попробуйте ещё раз.',
      };
    case 401:
      return {
        isRetryable: false,
        kind: 'authentication',
        message: 'Для продолжения требуется войти в систему.',
      };
    case 403:
      return {
        isRetryable: false,
        kind: 'authorization',
        message: 'У вас нет доступа к этому действию.',
      };
    case 404:
      return {
        isRetryable: false,
        kind: 'not-found',
        message: 'Запрошенные данные не найдены.',
      };
    case 409:
      return {
        isRetryable: false,
        kind: 'conflict',
        message: 'Данные изменились. Обновите страницу и попробуйте ещё раз.',
      };
    case 429:
      return {
        isRetryable: true,
        kind: 'rate-limit',
        message: 'Слишком много запросов. Попробуйте немного позже.',
      };
    default:
      if (status >= 500) {
        return {
          isRetryable: true,
          kind: 'server',
          message: 'Сервис временно недоступен. Попробуйте ещё раз.',
        };
      }

      return {
        isRetryable: false,
        kind: 'unknown',
        message: 'Не удалось выполнить запрос. Попробуйте ещё раз.',
      };
  }
}

export function mapApiError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (!axios.isAxiosError(error)) {
    return new AppError('Произошла непредвиденная ошибка.', {
      cause: error,
      code: null,
      isRetryable: false,
      kind: 'unknown',
      requestId: null,
      status: undefined,
    });
  }

  if (error.response === undefined) {
    return new AppError('Не удалось связаться с сервером. Проверьте подключение к сети.', {
      cause: error,
      code: null,
      isRetryable: true,
      kind: 'network',
      requestId: null,
      status: undefined,
    });
  }

  const status = error.response.status;
  const metadata = getErrorMetadata(error.response.data);
  const presentation = getErrorPresentation(status);

  return new AppError(presentation.message, {
    cause: error,
    code: metadata.code,
    isRetryable: presentation.isRetryable,
    kind: presentation.kind,
    requestId: metadata.requestId,
    status,
  });
}
