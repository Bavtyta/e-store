import { z } from 'zod';

const appEnvironmentSchema = z.enum(['local', 'test', 'staging', 'production']);

const booleanStringSchema = z.enum(['true', 'false']).transform((value) => value === 'true');

const emptyStringToUndefined = (value: unknown): unknown => {
  if (typeof value === 'string' && value.trim().length === 0) {
    return undefined;
  }

  return value;
};

const optionalPublicValueSchema = z.preprocess(
  emptyStringToUndefined,
  z.string().trim().max(256, 'Значение не должно превышать 256 символов.').optional(),
);

const optionalErrorReportingDsnSchema = z.preprocess(
  emptyStringToUndefined,
  z
    .string()
    .trim()
    .max(2048, 'VITE_ERROR_REPORTING_DSN не должен превышать 2048 символов.')
    .refine(
      (value) => {
        try {
          const url = new URL(value);

          return (
            (url.protocol === 'http:' || url.protocol === 'https:') &&
            url.password.length === 0 &&
            url.search.length === 0 &&
            url.hash.length === 0
          );
        } catch {
          return false;
        }
      },
      {
        message:
          'VITE_ERROR_REPORTING_DSN должен быть публичным HTTP(S) URL без пароля, query и hash.',
      },
    )
    .optional(),
);

const apiBaseUrlSchema = z
  .string()
  .trim()
  .min(1, 'VITE_API_BASE_URL не может быть пустым.')
  .refine(
    (value) => {
      if (value.startsWith('/') && !value.startsWith('//')) {
        return !value.includes('?') && !value.includes('#') && !value.includes('\\');
      }

      try {
        const url = new URL(value);

        return (
          (url.protocol === 'http:' || url.protocol === 'https:') &&
          url.username.length === 0 &&
          url.password.length === 0 &&
          url.search.length === 0 &&
          url.hash.length === 0
        );
      } catch {
        return false;
      }
    },
    {
      message:
        'VITE_API_BASE_URL должен быть относительным путём или HTTP(S) URL без credentials, query и hash.',
    },
  );

const publicSiteUrlSchema = z
  .string()
  .trim()
  .min(1, 'VITE_PUBLIC_SITE_URL не может быть пустым.')
  .transform((value, context) => {
    try {
      const url = new URL(value);

      if (
        (url.protocol !== 'http:' && url.protocol !== 'https:') ||
        url.username.length > 0 ||
        url.password.length > 0 ||
        url.pathname !== '/' ||
        url.search.length > 0 ||
        url.hash.length > 0
      ) {
        context.addIssue({
          code: 'custom',
          message:
            'VITE_PUBLIC_SITE_URL должен быть корневым HTTP(S) URL без credentials, path, query и hash.',
        });
        return z.NEVER;
      }

      return url.toString();
    } catch {
      context.addIssue({
        code: 'custom',
        message: 'VITE_PUBLIC_SITE_URL должен быть абсолютным HTTP(S) URL.',
      });
      return z.NEVER;
    }
  });

const environmentSchema = z.object({
  VITE_ANALYTICS_ID: optionalPublicValueSchema,
  VITE_API_BASE_URL: apiBaseUrlSchema,
  VITE_APP_ENV: appEnvironmentSchema,
  VITE_ERROR_REPORTING_DSN: optionalErrorReportingDsnSchema,
  VITE_MSW_ENABLED: booleanStringSchema,
  VITE_PUBLIC_SITE_URL: publicSiteUrlSchema,
});

export type AppEnvironment = z.infer<typeof appEnvironmentSchema>;

export interface AppConfig {
  readonly analyticsId: string | undefined;
  readonly apiBaseUrl: string;
  readonly appEnvironment: AppEnvironment;
  readonly errorReportingDsn: string | undefined;
  readonly mswEnabled: boolean;
  readonly publicSiteUrl: string;
}

export interface RawEnvironment {
  readonly VITE_ANALYTICS_ID: string | undefined;
  readonly VITE_API_BASE_URL: string | undefined;
  readonly VITE_APP_ENV: string | undefined;
  readonly VITE_ERROR_REPORTING_DSN: string | undefined;
  readonly VITE_MSW_ENABLED: string | undefined;
  readonly VITE_PUBLIC_SITE_URL: string | undefined;
}

export interface EnvironmentRuntime {
  readonly isDevelopmentServer: boolean;
  readonly isProductionBuild: boolean;
}

function isDeploymentEnvironment(environment: AppEnvironment): boolean {
  return environment === 'staging' || environment === 'production';
}

function createEnvironmentSchema(runtime: EnvironmentRuntime) {
  return environmentSchema.superRefine((environment, context) => {
    const isDeployment = isDeploymentEnvironment(environment.VITE_APP_ENV);

    if (runtime.isProductionBuild && !isDeployment) {
      context.addIssue({
        code: 'custom',
        message: 'Для production-сборки разрешены только значения staging или production.',
        path: ['VITE_APP_ENV'],
      });
    }

    if (isDeployment && environment.VITE_MSW_ENABLED) {
      context.addIssue({
        code: 'custom',
        message: 'Для staging и production значение должно быть false.',
        path: ['VITE_MSW_ENABLED'],
      });
    }

    if (isDeployment) {
      const publicSiteUrl = new URL(environment.VITE_PUBLIC_SITE_URL);

      if (publicSiteUrl.protocol !== 'https:') {
        context.addIssue({
          code: 'custom',
          message: 'Для staging и production требуется HTTPS URL.',
          path: ['VITE_PUBLIC_SITE_URL'],
        });
      }

      if (!environment.VITE_API_BASE_URL.startsWith('/')) {
        const apiBaseUrl = new URL(environment.VITE_API_BASE_URL);

        if (apiBaseUrl.protocol !== 'https:') {
          context.addIssue({
            code: 'custom',
            message: 'Абсолютный API URL для staging и production должен использовать HTTPS.',
            path: ['VITE_API_BASE_URL'],
          });
        }
      }
    }
  });
}

export function parseEnvironment(
  rawEnvironment: RawEnvironment,
  runtime: EnvironmentRuntime,
): Readonly<AppConfig> {
  const environmentResult = createEnvironmentSchema(runtime).safeParse(rawEnvironment);

  if (!environmentResult.success) {
    const details = environmentResult.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');

    throw new Error(`Некорректная конфигурация приложения: ${details}`);
  }

  const environment = environmentResult.data;

  return Object.freeze({
    analyticsId: environment.VITE_ANALYTICS_ID,
    apiBaseUrl: environment.VITE_API_BASE_URL,
    appEnvironment: environment.VITE_APP_ENV,
    errorReportingDsn: environment.VITE_ERROR_REPORTING_DSN,
    mswEnabled: runtime.isDevelopmentServer && environment.VITE_MSW_ENABLED,
    publicSiteUrl: environment.VITE_PUBLIC_SITE_URL,
  });
}
