import { formatCartMoney } from '@/entities/cart';
import { CheckoutPlaceholder } from '@/features/checkout-placeholder';
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
      <h2>Итоги корзины</h2>
      <div className={styles.rows}>
        <p className={styles.row}>
          <span>Сумма товаров ({formatLineCount(lineCount)})</span>
          <strong aria-atomic="true" aria-live="polite">
            {formatCartMoney(totalMinor)}
          </strong>
        </p>
        <p className={styles.row}>
          <span>НДС</span>
          <span className={styles.muted}>Включён в цену</span>
        </p>
        <p className={styles.row}>
          <span>Доставка</span>
          <span className={styles.muted}>По Самарской области</span>
        </p>
      </div>
      <p className={styles.total}>
        <span>Итого</span>
        <strong aria-atomic="true" aria-live="polite" className={styles.totalValue}>
          {formatCartMoney(totalMinor)}
        </strong>
      </p>
      {excludedFromTotalCount === 0 ? null : (
        <p className={styles.note}>
          {excludedFromTotalCount} поз. не включено в сумму: цена или доступность требует уточнения.
        </p>
      )}
      <p className={styles.disclaimer}>
        Цена и наличие требуют подтверждения после подключения каталога к&nbsp;1С.
      </p>
      <CheckoutPlaceholder />
    </Card>
  );
}
