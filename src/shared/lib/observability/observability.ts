import type { AppEnvironment } from '@/shared/config';

const componentStackPattern = /^\s*at\s+([A-Za-z][A-Za-z0-9_$.-]*)/gm;
const maximumComponentPathLength = 12;
const safeErrorNames = new Set([
  'AggregateError',
  'Error',
  'EvalError',
  'RangeError',
  'ReferenceError',
  'SyntaxError',
  'TypeError',
  'URIError',
]);

export type UnexpectedErrorSource = 'react-error-boundary';

export interface UnexpectedErrorContext {
  readonly componentStack: string | null | undefined;
  readonly source: UnexpectedErrorSource;
}

export interface UnexpectedErrorReport {
  readonly componentPath: readonly string[];
  readonly environment: AppEnvironment;
  readonly errorName: string;
  readonly source: UnexpectedErrorSource;
}

export interface ObservabilityAdapter {
  captureUnexpectedError(report: UnexpectedErrorReport): void;
}

export interface UnexpectedErrorReporter {
  reportUnexpectedError(error: unknown, context: UnexpectedErrorContext): void;
}

function getSafeErrorName(error: unknown): string {
  if (!(error instanceof Error)) {
    return 'UnknownError';
  }

  try {
    return safeErrorNames.has(error.name) ? error.name : 'UnknownError';
  } catch {
    return 'UnknownError';
  }
}

function getSafeComponentPath(componentStack: string | null | undefined): readonly string[] {
  if (!componentStack) {
    return Object.freeze([]);
  }

  const componentPath = Array.from(componentStack.matchAll(componentStackPattern))
    .map((match) => match[1])
    .filter((componentName): componentName is string => componentName !== undefined)
    .filter((componentName) => /^[A-Z]/.test(componentName))
    .slice(0, maximumComponentPathLength);

  return Object.freeze(componentPath);
}

export class Observability implements UnexpectedErrorReporter {
  constructor(
    private readonly environment: AppEnvironment,
    private readonly adapter: ObservabilityAdapter,
  ) {}

  reportUnexpectedError(error: unknown, context: UnexpectedErrorContext): void {
    const report: UnexpectedErrorReport = Object.freeze({
      componentPath: getSafeComponentPath(context.componentStack),
      environment: this.environment,
      errorName: getSafeErrorName(error),
      source: context.source,
    });

    try {
      this.adapter.captureUnexpectedError(report);
    } catch {
      // Сбой внешнего мониторинга не должен скрывать recovery UI приложения.
    }
  }
}
