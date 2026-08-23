import { createCartQuantityRules, useCartStore } from '@/entities/cart';
import type { ProductListItem } from '@/entities/product';
import { Button, ButtonLink } from '@/shared/ui';

export interface ProductCardAddToCartButtonProps {
  onAdded?: (event: ProductCardAddedEvent) => void;
  onVariantSelectionRequested?: (event: ProductCardVariantSelectionEvent) => void;
  product: ProductListItem;
}

export interface ProductCardAddedEvent {
  productId: string;
  quantity: string;
  variantId: string;
}

export interface ProductCardVariantSelectionEvent {
  productId: string;
}

export function ProductCardAddToCartButton({
  onAdded,
  onVariantSelectionRequested,
  product,
}: ProductCardAddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);
  const target = product.addToCartTarget;
  const rules =
    target === null
      ? null
      : createCartQuantityRules(
          target.minOrderQuantity,
          target.quantityStep,
          target.maxOrderQuantity,
        );
  const isUnavailable =
    product.purchaseAction === 'unavailable' ||
    product.availability.status === 'out_of_stock' ||
    target === null ||
    rules === null;

  if (product.purchaseAction === 'select_variant') {
    return (
      <ButtonLink
        isFullWidth
        onClick={() => {
          onVariantSelectionRequested?.({ productId: product.id });
        }}
        size="small"
        to={`/product/${product.slug}`}
        variant="secondary"
      >
        Выбрать вариант
      </ButtonLink>
    );
  }

  if (product.purchaseAction === 'direct' && product.priceType === 'on_request') {
    return (
      <ButtonLink isFullWidth size="small" to={`/product/${product.slug}`} variant="secondary">
        Уточнить цену и наличие
      </ButtonLink>
    );
  }

  function handleAdd(): void {
    if (target === null || rules === null || isUnavailable) {
      return;
    }

    addItem({
      initialQuantity: rules.min,
      rules,
      variantId: target.id,
    });
    onAdded?.({
      productId: product.id,
      quantity: rules.min,
      variantId: target.id,
    });
  }

  return (
    <Button
      disabled={isUnavailable}
      isFullWidth
      onClick={handleAdd}
      size="small"
      variant={isUnavailable ? 'secondary' : 'primary'}
    >
      {isUnavailable ? 'Недоступно' : 'В корзину'}
    </Button>
  );
}
