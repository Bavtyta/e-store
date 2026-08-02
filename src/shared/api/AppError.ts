export type AppErrorKind =
  | 'authentication'
  | 'authorization'
  | 'conflict'
  | 'network'
  | 'not-found'
  | 'rate-limit'
  | 'server'
  | 'unknown'
  | 'validation';

interface AppErrorOptions {
  cause: unknown;
  code: string | null;
  isRetryable: boolean;
  kind: AppErrorKind;
  requestId: string | null;
  status: number | undefined;
}

export class AppError extends Error {
  override readonly name = 'AppError';

  readonly code: string | null;
  readonly isRetryable: boolean;
  readonly kind: AppErrorKind;
  readonly requestId: string | null;
  readonly status: number | undefined;

  constructor(message: string, options: AppErrorOptions) {
    super(message, { cause: options.cause });

    this.code = options.code;
    this.isRetryable = options.isRetryable;
    this.kind = options.kind;
    this.requestId = options.requestId;
    this.status = options.status;
  }
}
