import { Link } from 'react-router';

import {
  formatProductPrice,
  mergeProductAttributes,
  ProductAttributes,
  ProductAvailability,
  ProductPrice,
} from '@/entities/product';
import type { ProductDetails as ProductDetailsModel, ProductVariant } from '@/entities/product';
import { AddToCartButton } from '@/features/add-to-cart';
import { VariantSelector } from '@/features/select-product-variant';
import type { VariantSelection } from '@/features/select-product-variant';

import styles from './product-details.module.css';

export interface ProductDetailsProps {
  isOptionAvailable: (groupCode: string, value: string) => boolean;
  onOptionSelect: (groupCode: string, value: string) => void;
  product: ProductDetailsModel;
  selectedOptions: VariantSelection;
  selectedVariant: ProductVariant | null;
}

export function ProductDetails({
  isOptionAvailable,
  onOptionSelect,
  product,
  selectedOptions,
  selectedVariant,
}: ProductDetailsProps) {
  const displayedVariant = selectedVariant ?? product.variants[0] ?? null;
  const attributes = mergeProductAttributes(product.attributes, displayedVariant?.attributes ?? []);

  return (
    <article className={styles.root}>
      <p aria-atomic="true" aria-live="polite" className={styles.announcement} role="status">
        {displayedVariant === null
          ? 'Доступных вариантов товара сейчас нет.'
          : `Выбран вариант «${displayedVariant.name}». Артикул ${displayedVariant.sku}. Цена ${formatProductPrice(displayedVariant.price, displayedVariant.priceType)}. Единица измерения: ${displayedVariant.unit.label}`}
      </p>
      <header className={styles.header}>
        <p className={styles.category}>{product.category.name}</p>
        <h1>{product.name}</h1>
        <dl className={styles.identity}>
          <div>
            <dt>Артикул</dt>
            <dd>{displayedVariant?.sku ?? 'Не указан'}</dd>
          </div>
        </dl>
      </header>

      <ProductPrice variant={displayedVariant} />

      <div className={styles.availability}>
        <span>Наличие</span>
        {displayedVariant === null ? (
          <span>Наличие уточняется</span>
        ) : (
          <ProductAvailability availability={displayedVariant.availability} />
        )}
      </div>

      {product.optionGroups.length === 0 ? null : (
        <section aria-labelledby="variant-title" className={styles.section}>
          <h2 id="variant-title">Выберите вариант</h2>
          <VariantSelector
            isOptionAvailable={isOptionAvailable}
            onOptionSelect={onOptionSelect}
            optionGroups={product.optionGroups}
            selectedOptions={selectedOptions}
          />
          {selectedVariant === null ? (
            <p className={styles.selectionWarning}>Доступных вариантов сейчас нет.</p>
          ) : null}
        </section>
      )}

      <AddToCartButton variant={selectedVariant} />

      {displayedVariant === null ? null : (
        <section aria-labelledby="order-title" className={styles.section}>
          <h2 id="order-title">Условия продажи</h2>
          <dl className={styles.orderInfo}>
            <div>
              <dt>Единица измерения</dt>
              <dd>{displayedVariant.unit.label}</dd>
            </div>
            <div>
              <dt>Минимальное количество</dt>
              <dd>{displayedVariant.minOrderQuantity}</dd>
            </div>
            <div>
              <dt>Шаг заказа</dt>
              <dd>{displayedVariant.quantityStep}</dd>
            </div>
            {displayedVariant.maxOrderQuantity === null ? null : (
              <div>
                <dt>Максимальное количество</dt>
                <dd>{displayedVariant.maxOrderQuantity}</dd>
              </div>
            )}
            {displayedVariant.packageQuantity === null ? null : (
              <div>
                <dt>В упаковке</dt>
                <dd>{displayedVariant.packageQuantity}</dd>
              </div>
            )}
          </dl>
        </section>
      )}

      <section aria-labelledby="attributes-title" className={styles.section}>
        <h2 id="attributes-title">Технические характеристики</h2>
        <ProductAttributes attributes={attributes} />
      </section>

      {product.description === null ? null : (
        <section aria-labelledby="description-title" className={styles.section}>
          <h2 id="description-title">Описание</h2>
          <p className={styles.description}>{product.description}</p>
        </section>
      )}

      <Link className={styles.backLink} to={product.category.path}>
        Вернуться в категорию «{product.category.name}»
      </Link>
    </article>
  );
}
