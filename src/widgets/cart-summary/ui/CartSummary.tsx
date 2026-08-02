import { formatCartMoney } from '@/entities/cart';
import { CheckoutPlaceholder } from '@/features/checkout-placeholder';
import { ClearCartButton } from '@/features/clear-cart';
import { Card } from '@/shared/ui';

import styles from './cart-summary.module.css';

export interface CartSummaryProps {
  excludedFromTotalCount: number;
  lineCount: number;
  totalMinor: bigint;
}

function formatLineCount(count: number): string {
  const lastTwoDigits = count % 100;
  const lastDigit = count % 10;
  const word =
    lastTwoDigits >= 11 && lastTwoDigits <= 14
      ? 'позиций'
      : lastDigit === 1
        ? 'позиция'
        : lastDigit >= 2 && lastDigit <= 4
          ? 'позиции'
          : 'позиций';

  return `${String(count)} ${word}`;
}

export function CartSummary({ excludedFromTotalCount, lineCount, totalMinor }: CartSummaryProps) {
  return (
    <Card className={styles.root} variant="elevated">
      <h2>Итого</h2>
      <p className={styles.row}>
        <span>В корзине</span>
        <strong>{formatLineCount(lineCount)}</strong>
      </p>
      <p className={styles.row}>
        <span>Предварительная сумма</span>
        <strong aria-atomic="true" aria-live="polite">
          {formatCartMoney(totalMinor)}
        </strong>
      </p>
      {excludedFromTotalCount === 0 ? null : (
        <p className={styles.note}>
          {excludedFromTotalCount} поз. не включено в сумму: цена или доступность требует уточнения.
        </p>
      )}
      <CheckoutPlaceholder />
      <ClearCartButton />
    </Card>
  );
}
