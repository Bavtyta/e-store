import { useEffect, useRef } from 'react';

import { useCartStore } from '@/entities/cart';
import { useResolveProductVariantsMutation } from '@/entities/product';

import { reconcileCart } from './reconcileCart';
import type { ReconciledCart } from './reconcileCart';

const EMPTY_CART: ReconciledCart = {
  excludedFromTotalCount: 0,
  lineCount: 0,
  lines: [],
  totalMinor: 0n,
};

export function useResolvedCart() {
  const hasHydrated = useCartStore((state) => state.hasHydrated);
  const items = useCartStore((state) => state.items);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const resolveMutation = useResolveProductVariantsMutation();
  const variantIdsKey = JSON.stringify(items.map((item) => item.variantId));
  const requestedVariantIdsKeyRef = useRef<string | null>(null);
  const { data, isError, isIdle, isPending, mutate, reset } = resolveMutation;

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    const variantIds = useCartStore.getState().items.map((item) => item.variantId);

    if (variantIds.length === 0) {
      requestedVariantIdsKeyRef.current = null;
      reset();
      return;
    }

    if (requestedVariantIdsKeyRef.current === variantIdsKey) {
      return;
    }

    requestedVariantIdsKeyRef.current = variantIdsKey;
    mutate({ variantIds });

    return () => {
      if (requestedVariantIdsKeyRef.current === variantIdsKey) {
        requestedVariantIdsKeyRef.current = null;
      }
    };
  }, [hasHydrated, mutate, reset, variantIdsKey]);

  useEffect(() => {
    if (data === undefined) {
      return;
    }

    const reconciledCart = reconcileCart(items, data);

    for (const line of reconciledCart.lines) {
      if (line.quantityRules !== null && line.quantity !== line.item.quantity) {
        setQuantity(line.item.variantId, line.quantity, line.quantityRules);
      }
    }
  }, [data, items, setQuantity]);

  const cart = data === undefined || items.length === 0 ? EMPTY_CART : reconcileCart(items, data);
  const retry = (): void => {
    const variantIds = useCartStore.getState().items.map((item) => item.variantId);

    if (variantIds.length > 0) {
      mutate({ variantIds });
    }
  };

  return {
    cart,
    isEmpty: hasHydrated && items.length === 0,
    isError: items.length > 0 && isError,
    isLoading: !hasHydrated || (items.length > 0 && !isError && (isIdle || isPending)),
    retry,
  };
}
