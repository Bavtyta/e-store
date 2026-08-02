import { appConfig } from '@/shared/config';
import { createDefaultObservabilityAdapter, Observability } from '@/shared/lib';

export const appObservability = new Observability(
  appConfig.appEnvironment,
  createDefaultObservabilityAdapter(appConfig.appEnvironment),
);
