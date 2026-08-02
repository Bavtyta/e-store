import { z } from 'zod';

import { isPositiveDecimal } from './decimal';

function isCanonicalIsoDate(value: string): boolean {
  const parsedDate = new Date(value);

  return !Number.isNaN(parsedDate.getTime()) && parsedDate.toISOString() === value;
}

export const cartItemSchema = z.strictObject({
  addedAt: z.string().refine(isCanonicalIsoDate),
  quantity: z.string().refine(isPositiveDecimal),
  variantId: z.string().trim().min(1),
});

export const cartPersistedStateSchema = z.strictObject({
  items: z.array(cartItemSchema),
});

export type CartItem = z.infer<typeof cartItemSchema>;
export type CartPersistedState = z.infer<typeof cartPersistedStateSchema>;
