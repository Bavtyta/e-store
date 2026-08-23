import { Analytics } from './analytics';
import type { AnalyticsAdapter } from './analytics';

describe('Analytics', () => {
  it('passes an immutable event snapshot to the adapter', () => {
    const captureEvent = vi.fn<AnalyticsAdapter['captureEvent']>();
    const analytics = new Analytics('production', { captureEvent });
    const properties: Record<string, boolean | number | string> = {
      result_count: 12,
    };

    analytics.trackEvent({ name: 'catalog_results_viewed', properties });
    properties.result_count = 99;

    const capturedEvent = captureEvent.mock.calls[0]?.[0];

    expect(capturedEvent).toEqual({
      environment: 'production',
      name: 'catalog_results_viewed',
      properties: { result_count: 12 },
    });
    expect(Object.isFrozen(capturedEvent)).toBe(true);
    expect(Object.isFrozen(capturedEvent?.properties)).toBe(true);
  });

  it('does not let an adapter failure interrupt the application', () => {
    const analytics = new Analytics('production', {
      captureEvent: () => {
        throw new Error('analytics provider is unavailable');
      },
    });

    expect(() => {
      analytics.trackEvent({ name: 'safe_event', properties: {} });
    }).not.toThrow();
  });

  it('keeps its reporter function safe when passed as a callback', () => {
    const captureEvent = vi.fn<AnalyticsAdapter['captureEvent']>();
    const analytics = new Analytics('test', { captureEvent });
    const trackEvent = analytics.trackEvent;

    trackEvent({ name: 'callback_event', properties: {} });

    expect(captureEvent).toHaveBeenCalledWith({
      environment: 'test',
      name: 'callback_event',
      properties: {},
    });
  });
});
