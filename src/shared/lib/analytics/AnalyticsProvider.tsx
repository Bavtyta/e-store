import type { ReactNode } from 'react';

import type { AnalyticsReporter } from './analytics';
import { analyticsContext } from './analyticsContext';

export interface AnalyticsProviderProps {
  children: ReactNode;
  reporter: AnalyticsReporter;
}

export function AnalyticsProvider({ children, reporter }: AnalyticsProviderProps) {
  return <analyticsContext.Provider value={reporter}>{children}</analyticsContext.Provider>;
}
