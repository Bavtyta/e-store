import { useContext } from 'react';

import { analyticsContext } from './analyticsContext';

export function useAnalytics() {
  return useContext(analyticsContext);
}
