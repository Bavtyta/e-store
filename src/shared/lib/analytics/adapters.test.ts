import {
  ANALYTICS_BROWSER_EVENT_NAME,
  createBrowserEventAnalyticsAdapter,
  createDefaultAnalyticsAdapter,
  noOpAnalyticsAdapter,
} from './adapters';
import type { AnalyticsEvent } from './analytics';

const testEvent: AnalyticsEvent = {
  environment: 'test',
  name: 'catalog_results_viewed',
  properties: { result_count: 12 },
};

describe('analytics adapters', () => {
  it('dispatches the vendor-neutral browser event', () => {
    const receivedEvents: AnalyticsEvent[] = [];
    const listener = (event: Event): void => {
      if (event instanceof CustomEvent) {
        receivedEvents.push(event.detail as AnalyticsEvent);
      }
    };

    window.addEventListener(ANALYTICS_BROWSER_EVENT_NAME, listener);

    try {
      createBrowserEventAnalyticsAdapter().captureEvent(testEvent);
    } finally {
      window.removeEventListener(ANALYTICS_BROWSER_EVENT_NAME, listener);
    }

    expect(receivedEvents).toEqual([testEvent]);
  });

  it('is safe when a browser window is unavailable', () => {
    vi.stubGlobal('window', undefined);

    try {
      expect(() => {
        createBrowserEventAnalyticsAdapter().captureEvent(testEvent);
      }).not.toThrow();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('uses browser events only in local and test environments', () => {
    expect(createDefaultAnalyticsAdapter('local')).not.toBe(noOpAnalyticsAdapter);
    expect(createDefaultAnalyticsAdapter('test')).not.toBe(noOpAnalyticsAdapter);
    expect(createDefaultAnalyticsAdapter('staging')).toBe(noOpAnalyticsAdapter);
    expect(createDefaultAnalyticsAdapter('production')).toBe(noOpAnalyticsAdapter);
  });
});
