import { Observability } from './observability';
import type { ObservabilityAdapter } from './observability';

describe('Observability', () => {
  it('passes only a sanitized allowlist to the adapter', () => {
    const captureUnexpectedError = vi.fn<ObservabilityAdapter['captureUnexpectedError']>();
    const observability = new Observability('production', {
      captureUnexpectedError,
    });
    const privateDetails = 'customer@example.com /cart?search=cement&address=private-address';

    observability.reportUnexpectedError(new Error(privateDetails), {
      componentStack: [
        '    at ProductPage (https://store.example/product/item?search=private)',
        '    at ErrorBoundary (https://store.example/assets/app.js)',
        '    at div (<anonymous>)',
      ].join('\n'),
      source: 'react-error-boundary',
    });

    expect(captureUnexpectedError).toHaveBeenCalledWith({
      componentPath: ['ProductPage', 'ErrorBoundary'],
      environment: 'production',
      errorName: 'Error',
      source: 'react-error-boundary',
    });

    const serializedReport = JSON.stringify(captureUnexpectedError.mock.calls[0]?.[0]);

    expect(serializedReport).not.toContain(privateDetails);
    expect(serializedReport).not.toContain('customer@example.com');
    expect(serializedReport).not.toContain('/cart');
    expect(serializedReport).not.toContain('search=');
  });

  it('does not let an adapter failure replace application recovery UI', () => {
    const observability = new Observability('production', {
      captureUnexpectedError: () => {
        throw new Error('monitoring is unavailable');
      },
    });

    expect(() => {
      observability.reportUnexpectedError(new Error('application failure'), {
        componentStack: null,
        source: 'react-error-boundary',
      });
    }).not.toThrow();
  });

  it('uses a safe fallback for non-standard error names', () => {
    const captureUnexpectedError = vi.fn<ObservabilityAdapter['captureUnexpectedError']>();
    const observability = new Observability('staging', {
      captureUnexpectedError,
    });
    const error = new Error('details');

    error.name = 'Unsafe name with user data';
    observability.reportUnexpectedError(error, {
      componentStack: undefined,
      source: 'react-error-boundary',
    });

    expect(captureUnexpectedError).toHaveBeenCalledWith(
      expect.objectContaining({
        componentPath: [],
        errorName: 'UnknownError',
      }),
    );
  });
});
