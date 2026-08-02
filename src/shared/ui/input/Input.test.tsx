import { render, screen } from '@testing-library/react';

import { Input } from '@/shared/ui';

describe('Input', () => {
  it('connects its label, hint and error to the input', () => {
    const { rerender } = render(<Input hint="Используйте понятное значение." label="Название" />);

    const input = screen.getByRole('textbox', { name: 'Название' });
    const hint = screen.getByText('Используйте понятное значение.');

    expect(input).toHaveAccessibleDescription('Используйте понятное значение.');
    expect(input).toHaveAttribute('aria-describedby', hint.id);
    expect(input).not.toHaveAttribute('aria-invalid', 'true');

    rerender(<Input error="Поле обязательно." label="Название" required />);

    expect(input).toBeRequired();
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Поле обязательно.');
    expect(screen.getByRole('alert')).toHaveTextContent('Поле обязательно.');
  });
});
