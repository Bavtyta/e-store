import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Card } from './Card';

describe('Card', () => {
  it('supports a padding-free domain layout', () => {
    render(
      <Card data-testid="card" padding="none">
        Содержимое
      </Card>,
    );

    expect(screen.getByTestId('card').className).toMatch(/none/);
  });
});
