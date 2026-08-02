import { render, screen } from '@testing-library/react';

import type { UnexpectedErrorReporter } from '@/shared/lib';

import { ErrorBoundary } from './ErrorBoundary';

function BrokenContent(): never {
  throw new Error('internal implementation details');
}

describe('ErrorBoundary', () => {
  it('shows a safe recovery screen and marks it as non-indexable', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    render(
      <ErrorBoundary>
        <BrokenContent />
      </ErrorBoundary>,
    );

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Не удалось отобразить страницу',
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Обновить страницу' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Перейти на главную' })).toHaveAttribute('href', '/');
    expect(screen.queryByText('internal implementation details')).not.toBeInTheDocument();
    expect(document.head.querySelector('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex, nofollow',
    );
  });

  it('reports an unexpected error without exposing it in the recovery screen', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const reportUnexpectedError = vi.fn<UnexpectedErrorReporter['reportUnexpectedError']>();

    render(
      <ErrorBoundary observability={{ reportUnexpectedError }}>
        <BrokenContent />
      </ErrorBoundary>,
    );

    expect(reportUnexpectedError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        source: 'react-error-boundary',
      }),
    );
    expect(screen.queryByText('internal implementation details')).not.toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Не удалось отобразить страницу',
      }),
    ).toBeInTheDocument();
  });
});
