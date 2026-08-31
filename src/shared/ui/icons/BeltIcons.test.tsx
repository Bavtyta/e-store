import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  CartIcon,
  FittingIcon,
  GasketIcon,
  InnerTubeIcon,
  PackageIcon,
  PipeIcon,
  SearchIcon,
} from './BeltIcons';

describe('BELT icon system', () => {
  it('uses the shared outline geometry and stays decorative', () => {
    const { container } = render(<SearchIcon size={18} />);
    const icon = container.querySelector('svg');

    expect(icon).toHaveAttribute('aria-hidden', 'true');
    expect(icon).toHaveAttribute('fill', 'none');
    expect(icon).toHaveAttribute('focusable', 'false');
    expect(icon).toHaveAttribute('height', '18');
    expect(icon).toHaveAttribute('stroke', 'currentColor');
    expect(icon).toHaveAttribute('stroke-linecap', 'round');
    expect(icon).toHaveAttribute('stroke-linejoin', 'round');
    expect(icon).toHaveAttribute('stroke-width', '1.75');
    expect(icon).toHaveAttribute('viewBox', '0 0 24 24');
    expect(icon).toHaveAttribute('width', '18');
  });

  it('allows presentation props without overriding system geometry', () => {
    const { container } = render(<CartIcon className="cart-icon" size={24} />);
    const icon = container.querySelector('svg');

    expect(icon).toHaveClass('cart-icon');
    expect(icon).toHaveAttribute('height', '24');
    expect(icon).toHaveAttribute('width', '24');
  });

  it('keeps catalog category icons in the shared outline system', () => {
    const { container } = render(
      <>
        <PipeIcon size={18} />
        <FittingIcon size={18} />
        <GasketIcon size={18} />
        <InnerTubeIcon size={18} />
        <PackageIcon size={18} />
      </>,
    );

    const icons = container.querySelectorAll('svg');
    expect(icons).toHaveLength(5);
    for (const icon of icons) {
      expect(icon).toHaveAttribute('aria-hidden', 'true');
      expect(icon).toHaveAttribute('fill', 'none');
      expect(icon).toHaveAttribute('stroke', 'currentColor');
      expect(icon).toHaveAttribute('stroke-width', '1.75');
      expect(icon).toHaveAttribute('width', '18');
    }
  });
});
