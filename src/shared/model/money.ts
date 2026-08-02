import { z } from 'zod';

export const moneySchema = z.strictObject({
  amountMinor: z.number().int(),
  currency: z.literal('RUB'),
});

export type Money = z.infer<typeof moneySchema>;

const rubleFormatter = new Intl.NumberFormat('ru-RU', {
  currency: 'RUB',
  style: 'currency',
});

export function mapMoneyDto(dto: unknown) {
  return moneySchema.safeParse(dto);
}

export function formatMoney(money: Money): string {
  return rubleFormatter.format(money.amountMinor / 100);
}
