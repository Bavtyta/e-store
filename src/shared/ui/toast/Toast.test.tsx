import { fireEvent, render, screen } from '@testing-library/react';

import { Toast } from '@/shared/ui';

describe('Toast', () => {
  it('announces a message and exposes an accessible dismiss action', () => {
    const handleDismiss = vi.fn();

    render(
      <Toast
        message="Настройки сохранены."
        onDismiss={handleDismiss}
        title="Готово"
        tone="success"
      />,
    );

    const toast = screen.getByRole('status');

    expect(toast).toHaveAttribute('aria-live', 'polite');
    expect(toast).toHaveTextContent('Готово');
    expect(toast).toHaveTextContent('Настройки сохранены.');

    fireEvent.click(screen.getByRole('button', { name: 'Закрыть уведомление' }));

    expect(handleDismiss).toHaveBeenCalledOnce();
  });
});
