import type { AppEnvironment } from '@/shared/config';

export type AnalyticsPropertyValue = boolean | number | string;
export type AnalyticsProperties = Readonly<Record<string, AnalyticsPropertyValue>>;

export interface AnalyticsEventInput {
  readonly name: string;
  readonly properties: AnalyticsProperties;
}

export interface AnalyticsEvent extends AnalyticsEventInput {
  readonly environment: AppEnvironment;
}

export interface AnalyticsAdapter {
  readonly captureEvent: (event: AnalyticsEvent) => void;
}

export interface AnalyticsReporter {
  readonly trackEvent: (event: AnalyticsEventInput) => void;
}

export class Analytics implements AnalyticsReporter {
  constructor(
    private readonly environment: AppEnvironment,
    private readonly adapter: AnalyticsAdapter,
  ) {}

  readonly trackEvent = (event: AnalyticsEventInput): void => {
    try {
      const capturedEvent: AnalyticsEvent = Object.freeze({
        environment: this.environment,
        name: event.name,
        properties: Object.freeze({ ...event.properties }),
      });

      this.adapter.captureEvent(capturedEvent);
    } catch {
      // Analytics must never interrupt the customer journey.
    }
  };
}
