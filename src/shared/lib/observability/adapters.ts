import type { AppEnvironment } from '@/shared/config';

import type { ObservabilityAdapter, UnexpectedErrorReport } from './observability';

const noOpObservabilityAdapter: ObservabilityAdapter = Object.freeze({
  captureUnexpectedError: () => undefined,
});

const localConsoleObservabilityAdapter: ObservabilityAdapter = Object.freeze({
  captureUnexpectedError: (report: UnexpectedErrorReport): void => {
    console.error('[observability]', report);
  },
});

export function createDefaultObservabilityAdapter(
  environment: AppEnvironment,
): ObservabilityAdapter {
  return environment === 'local' ? localConsoleObservabilityAdapter : noOpObservabilityAdapter;
}
