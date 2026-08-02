import {
  calculateLineTotalMinor,
  createCartQuantityRules,
  normalizeCartQuantity,
} from '@/entities/cart';
import type { CartItem, CartQuantityRules } from '@/entities/cart';
import type { CartResolvedVariant, ResolveVariantsResponse } from '@/entities/product';

export type ResolvedCartLineStatus =
  'available' | 'invalid-quantity-rules' | 'missing' | 'out-of-stock';

export interface ResolvedCartLine {
  item: CartItem;
  lineTotalMinor: bigint | null;
  quantity: string;
  quantityRules: CartQuantityRules | null;
  resolved: CartResolvedVariant | null;
  status: ResolvedCartLineStatus;
}

export interface ReconciledCart {
  excludedFromTotalCount: number;
  lineCount: number;
  lines: ResolvedCartLine[];
  totalMinor: bigint;
}

function getLineStatus(
  resolved: CartResolvedVariant | null,
  quantityRules: CartQuantityRules | null,
): ResolvedCartLineStatus {
  if (resolved === null) {
    return 'missing';
  }

  if (quantityRules === null) {
    return 'invalid-quantity-rules';
  }

  return resolved.variant.availability.status === 'out_of_stock' ? 'out-of-stock' : 'available';
}

export function reconcileCart(
  items: readonly CartItem[],
  response: ResolveVariantsResponse,
): ReconciledCart {
  const resolvedByVariantId = new Map(response.items.map((item) => [item.variant.id, item]));
  const lines = items.map<ResolvedCartLine>((item) => {
    const resolved = resolvedByVariantId.get(item.variantId) ?? null;
    const quantityRules =
      resolved === null
        ? null
        : createCartQuantityRules(
            resolved.variant.minOrderQuantity,
            resolved.variant.quantityStep,
            resolved.variant.maxOrderQuantity,
          );
    const status = getLineStatus(resolved, quantityRules);
    const quantity =
      quantityRules === null ? item.quantity : normalizeCartQuantity(item.quantity, quantityRules);
    const lineTotalMinor =
      status === 'available' &&
      resolved !== null &&
      resolved.variant.priceType === 'fixed' &&
      resolved.variant.price !== null
        ? calculateLineTotalMinor(resolved.variant.price.amountMinor, quantity)
        : null;

    return {
      item,
      lineTotalMinor,
      quantity,
      quantityRules,
      resolved,
      status,
    };
  });

  return {
    excludedFromTotalCount: lines.filter((line) => line.lineTotalMinor === null).length,
    lineCount: lines.length,
    lines,
    totalMinor: lines.reduce((total, line) => total + (line.lineTotalMinor ?? 0n), 0n),
  };
}
