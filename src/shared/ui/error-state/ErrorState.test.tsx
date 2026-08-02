import { fireEvent, render, screen } from '@testing-library/react';

import { Button, ErrorState } from '@/shared/ui';

describe('ErrorState', () => {
  it('announces a safe error and exposes recovery actions', () => {
    const handleRetry = vi.fn();
    const handleNavigate = vi.fn();

    render(
      <ErrorState
        action={
          <Button onClick={handleNavigate} variant="secondary">
            Перейти в каталог
          </Button>
        }
        description="Проверьте подключение и попробуйте ещё раз."
        onRetry={handleRetry}
        title="Не удалось загрузить данные"
      />,
    );

    const alert = screen.getByRole('alert');

    expect(alert).toHaveTextContent('Не удалось загрузить данные');
    expect(alert).not.toHaveTextContent('Axios');
    expect(alert).not.toHaveTextContent('stack');

    fireEvent.click(screen.getByRole('button', { name: 'Повторить' }));
    fireEvent.click(screen.getByRole('button', { name: 'Перейти в каталог' }));

    expect(handleRetry).toHaveBeenCalledOnce();
    expect(handleNavigate).toHaveBeenCalledOnce();
  });
});
