import { useCartStore } from '@/entities/cart';
import { Button } from '@/shared/ui';

export interface RemoveFromCartButtonProps {
  itemName: string;
  variantId: string;
}

export function RemoveFromCartButton({ itemName, variantId }: RemoveFromCartButtonProps) {
  const removeItem = useCartStore((state) => state.removeItem);

  return (
    <Button
      aria-label={`Удалить «${itemName}» из корзины`}
      onClick={() => {
        removeItem(variantId);
      }}
      size="small"
      variant="secondary"
    >
      Удалить
    </Button>
  );
}
