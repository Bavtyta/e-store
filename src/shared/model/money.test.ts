import { formatMoney, mapMoneyDto } from '@/shared/model';

function normalizeCurrencySpacing(value: string): string {
  return value.replaceAll(/[\u00a0\u202f]/g, ' ');
}

describe('Money', () => {
  it('validates an integer amount in kopecks', () => {
    const result = mapMoneyDto({
      amountMinor: 123_456,
      currency: 'RUB',
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data).toEqual({
        amountMinor: 123_456,
        currency: 'RUB',
      });
    }
  });

  it('rejects a fractional amountMinor without throwing', () => {
    expect(() =>
      mapMoneyDto({
        amountMinor: 10.5,
        currency: 'RUB',
      }),
    ).not.toThrow();

    const result = mapMoneyDto({
      amountMinor: 10.5,
      currency: 'RUB',
    });

    expect(result.success).toBe(false);
  });

  it('rejects a negative monetary amount', () => {
    expect(
      mapMoneyDto({
        amountMinor: -1,
        currency: 'RUB',
      }).success,
    ).toBe(false);
  });

  it('formats kopecks as Russian rubles', () => {
    const formatted = formatMoney({
      amountMinor: 123_456,
      currency: 'RUB',
    });

    expect(normalizeCurrencySpacing(formatted)).toBe('1 234,56 ₽');
  });
});
