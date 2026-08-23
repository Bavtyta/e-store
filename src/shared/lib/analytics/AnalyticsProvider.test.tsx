import { renderHook } from '@testing-library/react';
import type { PropsWithChildren } from 'react';

import { AnalyticsProvider } from './AnalyticsProvider';
import type { AnalyticsReporter } from './analytics';
import { useAnalytics } from './useAnalytics';

describe('AnalyticsProvider', () => {
  it('provides the configured reporter', () => {
    const reporter: AnalyticsReporter = {
      trackEvent: vi.fn(),
    };
    const wrapper = ({ children }: PropsWithChildren) => (
      <AnalyticsProvider reporter={reporter}>{children}</AnalyticsProvider>
    );
    const { result } = renderHook(() => useAnalytics(), { wrapper });

    expect(result.current).toBe(reporter);
  });

  it('provides a safe no-op reporter without an explicit provider', () => {
    const { result } = renderHook(() => useAnalytics());

    expect(() => {
      result.current.trackEvent({ name: 'test_event', properties: {} });
    }).not.toThrow();
  });
});
