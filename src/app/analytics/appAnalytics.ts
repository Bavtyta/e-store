import { appConfig } from '@/shared/config';
import { Analytics, createDefaultAnalyticsAdapter } from '@/shared/lib';
import type { AnalyticsReporter } from '@/shared/lib';

export function createAppAnalytics(): AnalyticsReporter {
  return new Analytics(
    appConfig.appEnvironment,
    createDefaultAnalyticsAdapter(appConfig.appEnvironment),
  );
}

export const appAnalytics = createAppAnalytics();
