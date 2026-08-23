import { createContext } from 'react';

import type { AnalyticsReporter } from './analytics';

const noOpAnalyticsReporter: AnalyticsReporter = Object.freeze({
  trackEvent: () => undefined,
});

export const analyticsContext = createContext<AnalyticsReporter>(noOpAnalyticsReporter);
