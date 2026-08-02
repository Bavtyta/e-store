import { fireEvent, render, screen } from '@testing-library/react';

import { Button, EmptyState } from '@/shared/ui';

describe('EmptyState', () => {
  it('describes the empty result and provides an optional action', () => {
    const handleRefresh = vi.fn();

    render(
      <EmptyState
        action={
          <Button onClick={handleRefresh} variant="secondary">
            Обновить
          </Button>
        }
        description="Данных для отображения пока нет."
        title="Пустой результат"
      />,
    );

    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByRole('heading', { name: 'Пустой результат' })).toBeInTheDocument();
    expect(screen.getByText('Данных для отображения пока нет.')).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Обновить' }));
    expect(handleRefresh).toHaveBeenCalledOnce();
  });
});
