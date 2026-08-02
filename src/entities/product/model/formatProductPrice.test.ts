import { formatProductPrice } from '@/entities/product';
import type { PriceType } from '@/entities/product';
import type { Money } from '@/shared/model';

const PRICE: Money = {
  amountMinor: 123_456,
  currency: 'RUB',
};

function normalizeCurrencySpacing(value: string): string {
  return value.replaceAll(/[\u00a0\u202f]/g, ' ');
}

describe('formatProductPrice', () => {
  it.each([
    ['fixed', '1 234,56 ₽'],
    ['from', 'от 1 234,56 ₽'],
  ] satisfies [PriceType, string][])('formats %s price', (priceType, expected) => {
    expect(normalizeCurrencySpacing(formatProductPrice(PRICE, priceType))).toBe(expected);
  });

  it('displays an on-request price without a fictitious amount', () => {
    expect(formatProductPrice(null, 'on_request')).toBe('Цена по запросу');
  });

  it('displays a safe fallback when a fixed amount is missing', () => {
    expect(formatProductPrice(null, 'fixed')).toBe('Цена не указана');
  });
});
