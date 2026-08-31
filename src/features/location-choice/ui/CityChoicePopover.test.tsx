import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { CityChoicePopover } from './CityChoicePopover';

describe('CityChoicePopover', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('stays closed initially, opens on click, and restores focus after Escape', () => {
    render(<CityChoicePopover />);

    const trigger = screen.getByRole('button', { name: 'Ваш город: Тольятти' });

    expect(trigger.querySelector('svg[aria-hidden="true"]')).toBeInTheDocument();

    expect(screen.queryByRole('dialog', { name: 'Выберите город' })).not.toBeInTheDocument();
    fireEvent.click(trigger);
    expect(screen.getByRole('dialog', { name: 'Выберите город' })).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog', { name: 'Выберите город' })).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('closes on an outside pointer press and restores focus', async () => {
    render(<CityChoicePopover />);

    const trigger = screen.getByRole('button', { name: 'Ваш город: Тольятти' });
    fireEvent.click(trigger);
    fireEvent.pointerDown(document.body);

    expect(screen.queryByRole('dialog', { name: 'Выберите город' })).not.toBeInTheDocument();
    await waitFor(() => {
      expect(trigger).toHaveFocus();
    });
  });

  it('persists a confirmed choice across remounts', () => {
    const firstRender = render(<CityChoicePopover />);

    fireEvent.click(screen.getByRole('button', { name: 'Ваш город: Тольятти' }));
    fireEvent.change(screen.getByRole('combobox', { name: 'Город' }), {
      target: { value: 'Самара' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Подтвердить' }));

    expect(screen.getByRole('button', { name: 'Ваш город: Самара' })).toHaveFocus();
    firstRender.unmount();
    render(<CityChoicePopover />);

    expect(screen.getByRole('button', { name: 'Ваш город: Самара' })).toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: 'Выберите город' })).not.toBeInTheDocument();
  });
});
