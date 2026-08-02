import { fireEvent, render, screen } from '@testing-library/react';

import { Button } from '@/shared/ui';

describe('Button', () => {
  it('handles activation and blocks it while loading', () => {
    const handleClick = vi.fn();
    const { rerender } = render(<Button onClick={handleClick}>Сохранить</Button>);

    const button = screen.getByRole('button', { name: 'Сохранить' });
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);

    rerender(
      <Button isLoading onClick={handleClick}>
        Сохранить
      </Button>,
    );

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');

    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
