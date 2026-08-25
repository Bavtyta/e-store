import { render, screen } from '@testing-library/react';

import { CheckoutPlaceholder } from './CheckoutPlaceholder';

describe('CheckoutPlaceholder', () => {
  it('explains the current cart limitation without presenting a false checkout action', () => {
    render(<CheckoutPlaceholder />);

    expect(screen.getByText('Оформление заказа пока недоступно')).toBeInTheDocument();
    expect(
      screen.getByText('Выбранные позиции сохраняются в корзине на этом устройстве.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Оформить заказ' })).not.toBeInTheDocument();
  });
});
