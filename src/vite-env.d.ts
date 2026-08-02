/// <reference types="vite/client" />

declare const __DEV_SERVER__: boolean;

interface ImportMetaEnv {
  readonly VITE_ANALYTICS_ID?: string;
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_APP_ENV?: string;
  readonly VITE_ERROR_REPORTING_DSN?: string;
  readonly VITE_MSW_ENABLED?: string;
  readonly VITE_PUBLIC_SITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
