import { useEffect, useState } from 'react';

import { createCartQuantityRules, useCartStore } from '@/entities/cart';
import type { ProductVariant } from '@/entities/product';
import { Button, Toast } from '@/shared/ui';

import styles from './add-to-cart-button.module.css';

export interface AddToCartButtonProps {
  variant: ProductVariant | null;
}

export function AddToCartButton({ variant }: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [feedbackVersion, setFeedbackVersion] = useState(0);
  const rules =
    variant === null
      ? null
      : createCartQuantityRules(
          variant.minOrderQuantity,
          variant.quantityStep,
          variant.maxOrderQuantity,
        );
  const isUnavailable =
    variant === null || variant.availability.status === 'out_of_stock' || rules === null;

  useEffect(() => {
    if (feedbackVersion === 0) {
      return;
    }

    const timerId = window.setTimeout(() => {
      setFeedbackVersion(0);
    }, 3_500);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [feedbackVersion]);

  return (
    <div className={styles.root}>
      <Button
        disabled={isUnavailable}
        isFullWidth
        onClick={() => {
          if (variant === null || rules === null || isUnavailable) {
            return;
          }

          addItem({
            initialQuantity: rules.min,
            rules,
            variantId: variant.id,
          });
          setFeedbackVersion((currentVersion) => currentVersion + 1);
        }}
      >
        В корзину
      </Button>
      {feedbackVersion === 0 ? null : (
        <Toast
          message={`Добавлено ${rules?.min ?? ''} ${variant?.unit.label ?? ''}`}
          onDismiss={() => {
            setFeedbackVersion(0);
          }}
          title="Товар добавлен в корзину"
          tone="success"
        />
      )}
    </div>
  );
}
