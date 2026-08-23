import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

import { Button, ButtonLink } from '@/shared/ui';

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

  it('renders navigation styled as a button without changing link semantics', () => {
    render(
      <MemoryRouter>
        <ButtonLink isFullWidth size="small" to="/catalog" variant="secondary">
          Открыть каталог
        </ButtonLink>
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'Открыть каталог' })).toHaveAttribute(
      'href',
      '/catalog',
    );
    expect(screen.queryByRole('button', { name: 'Открыть каталог' })).not.toBeInTheDocument();
  });
});
