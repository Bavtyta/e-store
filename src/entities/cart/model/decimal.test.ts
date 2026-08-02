import {
  calculateCartTotalMinor,
  calculateLineTotalMinor,
  canDecrementCartQuantity,
  canIncrementCartQuantity,
  createCartQuantityRules,
  decrementCartQuantity,
  formatCartMoney,
  incrementCartQuantity,
  normalizeCartQuantity,
} from './decimal';

describe('cart decimal calculations', () => {
  it('normalizes a decimal quantity to the nearest step from the minimum', () => {
    const rules = createCartQuantityRules('0.5', '0.5', null);

    expect(rules).not.toBeNull();

    if (rules === null) {
      return;
    }

    expect(normalizeCartQuantity('0.1', rules)).toBe('0.5');
    expect(normalizeCartQuantity('1.24', rules)).toBe('1');
    expect(normalizeCartQuantity('1.25', rules)).toBe('1.5');
    expect(normalizeCartQuantity('1,5', rules)).toBe('1.5');
  });

  it('aligns the maximum to a valid step and respects both boundaries', () => {
    const rules = createCartQuantityRules('0.5', '0.5', '2.2');

    expect(rules).toEqual({
      max: '2',
      min: '0.5',
      step: '0.5',
    });

    if (rules === null) {
      return;
    }

    expect(normalizeCartQuantity('10', rules)).toBe('2');
    expect(incrementCartQuantity('2', rules)).toBe('2');
    expect(decrementCartQuantity('0.5', rules)).toBe('0.5');
    expect(canIncrementCartQuantity('2', rules)).toBe(false);
    expect(canDecrementCartQuantity('0.5', rules)).toBe(false);
  });

  it('increments and decrements without floating-point drift', () => {
    const rules = createCartQuantityRules('0.1', '0.1', null);

    expect(rules).not.toBeNull();

    if (rules === null) {
      return;
    }

    expect(incrementCartQuantity('0.2', rules)).toBe('0.3');
    expect(decrementCartQuantity('0.3', rules)).toBe('0.2');
  });

  it('rounds each line half-up to a kopeck using bigint arithmetic', () => {
    expect(calculateLineTotalMinor(199, '0.5')).toBe(100n);
    expect(calculateLineTotalMinor(10, '0.05')).toBe(1n);
    expect(
      calculateCartTotalMinor([
        { amountMinor: 199, quantity: '0.5' },
        { amountMinor: 10, quantity: '0.05' },
      ]),
    ).toBe(101n);
  });

  it('rejects unsafe money inputs and formats a bigint total', () => {
    expect(calculateLineTotalMinor(Number.MAX_SAFE_INTEGER + 1, '1')).toBeNull();
    expect(formatCartMoney(12_345_678n)).toBe('123 456,78 ₽');
  });
});
