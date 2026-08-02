import { useState } from 'react';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { Dialog } from '@/shared/ui';

function DialogExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => {
          setIsOpen(true);
        }}
        type="button"
      >
        Открыть
      </button>
      <Dialog
        footer={<button type="button">Продолжить</button>}
        onClose={() => {
          setIsOpen(false);
        }}
        open={isOpen}
        title="Подтверждение"
      >
        <p>Содержимое диалога.</p>
      </Dialog>
    </>
  );
}

describe('Dialog', () => {
  it('traps focus, closes with Escape and restores focus', async () => {
    render(<DialogExample />);

    const opener = screen.getByRole('button', { name: 'Открыть' });
    opener.focus();
    fireEvent.click(opener);

    const dialog = screen.getByRole('dialog', { name: 'Подтверждение' });
    const closeButton = screen.getByRole('button', {
      name: 'Закрыть диалог',
    });
    const lastButton = screen.getByRole('button', { name: 'Продолжить' });

    await waitFor(() => {
      expect(closeButton).toHaveFocus();
    });

    fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: true });
    expect(lastButton).toHaveFocus();

    fireEvent.keyDown(dialog, { key: 'Tab' });
    expect(closeButton).toHaveFocus();

    fireEvent.keyDown(dialog, { key: 'Escape' });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await waitFor(() => {
      expect(opener).toHaveFocus();
    });
  });
});
