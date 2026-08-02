import { useState } from 'react';
import type { ChangeEvent, KeyboardEvent } from 'react';

import {
  canDecrementCartQuantity,
  canIncrementCartQuantity,
  createCartQuantityRules,
  normalizeCartQuantity,
  useCartStore,
} from '@/entities/cart';
import type { ProductVariant } from '@/entities/product';
import { IconButton, NumberInput } from '@/shared/ui';

import styles from './quantity-control.module.css';

export interface QuantityControlProps {
  itemName: string;
  quantity: string;
  variant: ProductVariant;
}

export function QuantityControl({ itemName, quantity, variant }: QuantityControlProps) {
  const decrementItem = useCartStore((state) => state.decrementItem);
  const incrementItem = useCartStore((state) => state.incrementItem);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const [draftState, setDraftState] = useState(() => ({
    sourceQuantity: quantity,
    value: quantity,
  }));
  const draftQuantity = draftState.sourceQuantity === quantity ? draftState.value : quantity;
  const rules = createCartQuantityRules(
    variant.minOrderQuantity,
    variant.quantityStep,
    variant.maxOrderQuantity,
  );

  if (rules === null) {
    return <p>Количество недоступно для изменения.</p>;
  }

  const commitDraft = (): void => {
    const normalizedQuantity = normalizeCartQuantity(draftQuantity, rules);

    setDraftState({
      sourceQuantity: quantity,
      value: normalizedQuantity,
    });
    setQuantity(variant.id, normalizedQuantity, rules);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setDraftState({
      sourceQuantity: quantity,
      value: event.currentTarget.value,
    });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        decrementItem(variant.id, rules);
        break;
      case 'ArrowUp':
        event.preventDefault();
        incrementItem(variant.id, rules);
        break;
      case 'Enter':
        event.preventDefault();
        commitDraft();
        break;
      case 'Escape':
        event.preventDefault();
        setDraftState({
          sourceQuantity: quantity,
          value: quantity,
        });
        break;
    }
  };

  return (
    <div className={styles.root}>
      <IconButton
        disabled={!canDecrementCartQuantity(quantity, rules)}
        label={`Уменьшить количество «${itemName}»`}
        onClick={() => {
          decrementItem(variant.id, rules);
        }}
        variant="ghost"
      >
        −
      </IconButton>
      <NumberInput
        className={styles.input}
        label={`Количество «${itemName}»`}
        max={rules.max ?? undefined}
        min={rules.min}
        onBlur={commitDraft}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        step={rules.step}
        value={draftQuantity}
      />
      <IconButton
        disabled={!canIncrementCartQuantity(quantity, rules)}
        label={`Увеличить количество «${itemName}»`}
        onClick={() => {
          incrementItem(variant.id, rules);
        }}
        variant="ghost"
      >
        +
      </IconButton>
      <span className={styles.unit}>{variant.unit.label}</span>
      <span aria-atomic="true" aria-live="polite" className={styles.announcement} role="status">
        Количество «{itemName}»: {quantity} {variant.unit.label}
      </span>
    </div>
  );
}
