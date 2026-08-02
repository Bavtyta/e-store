import { parseEnvironment } from './parseEnvironment';
import type { EnvironmentRuntime, RawEnvironment } from './parseEnvironment';

const developmentRuntime: EnvironmentRuntime = {
  isDevelopmentServer: true,
  isProductionBuild: false,
};

const productionRuntime: EnvironmentRuntime = {
  isDevelopmentServer: false,
  isProductionBuild: true,
};

function createRawEnvironment(overrides: Partial<RawEnvironment> = {}): RawEnvironment {
  return {
    VITE_ANALYTICS_ID: '',
    VITE_API_BASE_URL: '/api/v1',
    VITE_APP_ENV: 'local',
    VITE_ERROR_REPORTING_DSN: '',
    VITE_MSW_ENABLED: 'true',
    VITE_PUBLIC_SITE_URL: 'http://localhost:5173',
    ...overrides,
  };
}

describe('parseEnvironment', () => {
  it('parses a local environment and enables MSW only on the development server', () => {
    const config = parseEnvironment(createRawEnvironment(), developmentRuntime);

    expect(config).toEqual({
      analyticsId: undefined,
      apiBaseUrl: '/api/v1',
      appEnvironment: 'local',
      errorReportingDsn: undefined,
      mswEnabled: true,
      publicSiteUrl: 'http://localhost:5173/',
    });
    expect(Object.isFrozen(config)).toBe(true);
  });

  it('reports the exact missing variable', () => {
    expect(() =>
      parseEnvironment(
        createRawEnvironment({
          VITE_API_BASE_URL: undefined,
        }),
        developmentRuntime,
      ),
    ).toThrow(/VITE_API_BASE_URL/);
  });

  it('rejects a local environment in a production build', () => {
    expect(() => parseEnvironment(createRawEnvironment(), productionRuntime)).toThrow(
      /VITE_APP_ENV/,
    );
  });

  it('rejects MSW in staging and production environments', () => {
    expect(() =>
      parseEnvironment(
        createRawEnvironment({
          VITE_APP_ENV: 'staging',
          VITE_PUBLIC_SITE_URL: 'https://staging.example.invalid',
        }),
        productionRuntime,
      ),
    ).toThrow(/VITE_MSW_ENABLED/);
  });

  it('requires HTTPS public and absolute API URLs for a deployment environment', () => {
    expect(() =>
      parseEnvironment(
        createRawEnvironment({
          VITE_API_BASE_URL: 'http://api.example.invalid/api/v1',
          VITE_APP_ENV: 'production',
          VITE_MSW_ENABLED: 'false',
          VITE_PUBLIC_SITE_URL: 'http://storefront.example.invalid',
        }),
        productionRuntime,
      ),
    ).toThrow(/HTTPS/);
  });

  it('rejects credentials, query and hash in API configuration', () => {
    expect(() =>
      parseEnvironment(
        createRawEnvironment({
          VITE_API_BASE_URL: 'https://user@example.invalid/api/v1?token=value#fragment',
        }),
        developmentRuntime,
      ),
    ).toThrow(/VITE_API_BASE_URL/);
  });

  it('accepts public observability identifiers without enabling an adapter', () => {
    const config = parseEnvironment(
      createRawEnvironment({
        VITE_ANALYTICS_ID: 'analytics-public-id',
        VITE_ERROR_REPORTING_DSN: 'https://public-key@errors.example.invalid/project',
      }),
      developmentRuntime,
    );

    expect(config.analyticsId).toBe('analytics-public-id');
    expect(config.errorReportingDsn).toBe('https://public-key@errors.example.invalid/project');
  });

  it('rejects query parameters in an error-reporting DSN', () => {
    expect(() =>
      parseEnvironment(
        createRawEnvironment({
          VITE_ERROR_REPORTING_DSN:
            'https://public-key@errors.example.invalid/project?customer=private',
        }),
        developmentRuntime,
      ),
    ).toThrow(/VITE_ERROR_REPORTING_DSN/);
  });
});
