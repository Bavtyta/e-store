import { formatMoney } from '@/shared/model';

import { formatProductPrice } from '../model/formatProductPrice';
import type { PriceType, ProductVariant } from '../model/product';

import styles from './product-price.module.css';

const priceTypeLabels: Readonly<Record<PriceType, string>> = {
  fixed: 'Фиксированная цена',
  from: 'Начальная цена',
  on_request: 'Условия цены',
};

export interface ProductPriceProps {
  variant: ProductVariant | null;
}

export function ProductPrice({ variant }: ProductPriceProps) {
  if (variant === null) {
    return (
      <div aria-label="Цена" className={styles.root}>
        <span className={styles.type}>Цена</span>
        <strong className={styles.current}>Цена не указана</strong>
      </div>
    );
  }

  return (
    <div aria-label="Цена" className={styles.root}>
      <span className={styles.type}>{priceTypeLabels[variant.priceType]}</span>
      <strong className={styles.current}>
        {formatProductPrice(variant.price, variant.priceType)}
      </strong>
      {variant.oldPrice === null ? null : (
        <span className={styles.old}>
          Старая цена: <s>{formatMoney(variant.oldPrice)}</s>
        </span>
      )}
    </div>
  );
}
