import type { AppEnvironment } from '@/shared/config';

import type { AnalyticsAdapter, AnalyticsEvent } from './analytics';

export const ANALYTICS_BROWSER_EVENT_NAME = 'storefront:analytics';

export const noOpAnalyticsAdapter: AnalyticsAdapter = Object.freeze({
  captureEvent: () => undefined,
});

export function createBrowserEventAnalyticsAdapter(): AnalyticsAdapter {
  return Object.freeze({
    captureEvent: (event: AnalyticsEvent): void => {
      if (typeof window === 'undefined' || typeof window.CustomEvent !== 'function') {
        return;
      }

      window.dispatchEvent(
        new window.CustomEvent<AnalyticsEvent>(ANALYTICS_BROWSER_EVENT_NAME, {
          detail: event,
        }),
      );
    },
  });
}

export function createDefaultAnalyticsAdapter(environment: AppEnvironment): AnalyticsAdapter {
  return environment === 'local' || environment === 'test'
    ? createBrowserEventAnalyticsAdapter()
    : noOpAnalyticsAdapter;
}
