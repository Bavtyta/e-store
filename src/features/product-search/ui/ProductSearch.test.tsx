import { fireEvent, render, screen } from '@testing-library/react';

import { ProductSearch } from './ProductSearch';

describe('ProductSearch', () => {
  it('keeps keyboard focus when an external search value changes', () => {
    const onSearchSubmit = vi.fn();
    const { rerender } = render(<ProductSearch onSearchSubmit={onSearchSubmit} value="" />);
    const input = screen.getByRole('searchbox', { name: 'Поиск товаров' });

    input.focus();
    rerender(<ProductSearch onSearchSubmit={onSearchSubmit} value="ПНД" />);

    expect(document.activeElement).toBe(input);
    expect(input).toHaveValue('ПНД');
  });

  it('submits explicitly instead of searching on every keystroke', () => {
    const onSearchSubmit = vi.fn();
    render(<ProductSearch onSearchSubmit={onSearchSubmit} value="" />);

    fireEvent.change(screen.getByRole('searchbox', { name: 'Поиск товаров' }), {
      target: { value: 'ПВХ 110 мм' },
    });
    expect(onSearchSubmit).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Найти' }));

    expect(onSearchSubmit).toHaveBeenCalledOnce();
    expect(onSearchSubmit).toHaveBeenCalledWith('ПВХ 110 мм');
  });

  it('drops a submitted draft when the external search value is cleared', () => {
    const onSearchSubmit = vi.fn();
    const { rerender } = render(<ProductSearch onSearchSubmit={onSearchSubmit} value="" />);
    const input = screen.getByRole('searchbox', { name: 'Поиск товаров' });

    fireEvent.change(input, { target: { value: 'ПВХ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Найти' }));
    rerender(<ProductSearch onSearchSubmit={onSearchSubmit} value="ПВХ" />);
    rerender(<ProductSearch onSearchSubmit={onSearchSubmit} value="" />);

    expect(input).toHaveValue('');
  });
});
