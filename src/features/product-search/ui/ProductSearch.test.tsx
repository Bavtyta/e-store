import { render, screen } from '@testing-library/react';

import { ProductSearch } from './ProductSearch';

describe('ProductSearch', () => {
  it('keeps keyboard focus when an external search value changes', () => {
    const onSearchChange = vi.fn();
    const { rerender } = render(<ProductSearch onSearchChange={onSearchChange} value="" />);
    const input = screen.getByRole('searchbox', { name: 'Поиск товаров' });

    input.focus();
    rerender(<ProductSearch onSearchChange={onSearchChange} value="ПНД" />);

    expect(document.activeElement).toBe(input);
    expect(input).toHaveValue('ПНД');
  });
});
