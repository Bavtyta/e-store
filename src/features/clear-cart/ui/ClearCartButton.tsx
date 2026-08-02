import { useState } from 'react';

import { useCartStore } from '@/entities/cart';
import { Button, Dialog } from '@/shared/ui';

export function ClearCartButton() {
  const clearCart = useCartStore((state) => state.clearCart);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => {
          setIsConfirmationOpen(true);
        }}
        variant="danger"
      >
        Очистить корзину
      </Button>
      <Dialog
        description="Все сохранённые позиции будут удалены с этого устройства."
        footer={
          <>
            <Button
              onClick={() => {
                setIsConfirmationOpen(false);
              }}
              variant="secondary"
            >
              Отмена
            </Button>
            <Button
              onClick={() => {
                clearCart();
                setIsConfirmationOpen(false);
              }}
              variant="danger"
            >
              Очистить
            </Button>
          </>
        }
        onClose={() => {
          setIsConfirmationOpen(false);
        }}
        open={isConfirmationOpen}
        title="Очистить корзину?"
      >
        <p>Это действие нельзя отменить.</p>
      </Dialog>
    </>
  );
}
