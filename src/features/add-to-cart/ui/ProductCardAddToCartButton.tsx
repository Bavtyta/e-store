import { createCartQuantityRules, useCartStore } from '@/entities/cart';
import type { ProductListItem } from '@/entities/product';
import { Button } from '@/shared/ui';

export interface ProductCardAddToCartButtonProps {
  product: ProductListItem;
}

export function ProductCardAddToCartButton({ product }: ProductCardAddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);
  const target = product.addToCartTarget;
  const rules =
    target === null
      ? null
      : createCartQuantityRules(target.minOrderQuantity, target.quantityStep, target.maxOrderQuantity);
  const isUnavailable =
    target === null || rules === null || product.availability.status === 'out_of_stock';

  function handleAdd(): void {
    if (target === null || rules === null || isUnavailable) {
      return;
    }

    addItem({
      initialQuantity: rules.min,
      rules,
      variantId: target.id,
    });
  }

  return (
    <Button
      disabled={isUnavailable}
      isFullWidth
      onClick={handleAdd}
      size="small"
      variant="secondary"
    >
      В корзину
    </Button>
  );
}