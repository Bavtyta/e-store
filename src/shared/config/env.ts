import { parseEnvironment } from './parseEnvironment';

export const appConfig = parseEnvironment(
  {
    VITE_ANALYTICS_ID: import.meta.env.VITE_ANALYTICS_ID,
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    VITE_APP_ENV: import.meta.env.VITE_APP_ENV,
    VITE_ERROR_REPORTING_DSN: import.meta.env.VITE_ERROR_REPORTING_DSN,
    VITE_MSW_ENABLED: import.meta.env.VITE_MSW_ENABLED,
    VITE_PUBLIC_SITE_URL: import.meta.env.VITE_PUBLIC_SITE_URL,
  },
  {
    isDevelopmentServer: import.meta.env.DEV,
    isProductionBuild: import.meta.env.PROD,
  },
);

export const isMswEnabled = appConfig.mswEnabled;
