import type { ReactNode } from 'react';
import { Link } from 'react-router';

import { Badge, Card, ImageIcon } from '@/shared/ui';

import type { ProductListItem } from '../model/product';
import { formatProductPrice } from '../model/formatProductPrice';

import { ProductAvailability } from './ProductAvailability';
import styles from './product-card.module.css';

export interface ProductCardProps {
  action?: ReactNode;
  onProductOpen?: (event: ProductCardOpenEvent) => void;
  overlayAction?: ReactNode;
  product: ProductListItem;
}

export type ProductCardOpenTrigger = 'image' | 'title';

export interface ProductCardOpenEvent {
  product: ProductListItem;
  trigger: ProductCardOpenTrigger;
}

function formatAttributeValue(value: ProductListItem['shortAttributes'][number]): string {
  if (value.value === true) return 'Да';
  if (value.value === false) return 'Нет';

  return String(value.value);
}

interface ProductCardPricePresentation {
  condition: string | null;
  primary: string;
  unit: string;
}

function getPricePresentation(product: ProductListItem): ProductCardPricePresentation {
  const unitLabel = product.primaryUnit.label;

  if (product.packageQuantity !== null) {
    const unitPrice = formatProductPrice(product.priceFrom, product.priceType);
    const condition =
      product.priceFrom === null
        ? `В упаковке: ${product.packageQuantity} ${unitLabel}`
        : `В упаковке: ${product.packageQuantity} ${unitLabel} · ${unitPrice} за 1 ${unitLabel}`;

    return {
      condition,
      primary: formatProductPrice(product.packagePriceFrom, product.priceType),
      unit: 'за упаковку',
    };
  }

  if (product.purchaseAction === 'select_variant') {
    return {
      condition: 'Цена и наличие зависят от выбранного варианта',
      primary: formatProductPrice(product.priceFrom, product.priceType),
      unit: `за 1 ${unitLabel}`,
    };
  }

  if (product.purchaseAction === 'unavailable') {
    return {
      condition: 'Покупка сейчас недоступна',
      primary: formatProductPrice(product.priceFrom, product.priceType),
      unit: `за 1 ${unitLabel}`,
    };
  }

  const minimumQuantity = product.addToCartTarget?.minOrderQuantity;

  return {
    condition:
      minimumQuantity === undefined
        ? 'Условия заказа уточняются'
        : Number(minimumQuantity) === 1
          ? null
          : `Минимальный заказ: ${minimumQuantity} ${unitLabel}`,
    primary: formatProductPrice(product.priceFrom, product.priceType),
    unit: `за 1 ${unitLabel}`,
  };
}

export function ProductCard({ action, onProductOpen, overlayAction, product }: ProductCardProps) {
  const price = getPricePresentation(product);
  const visibleAttributes = [...product.shortAttributes]
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .slice(0, 2);

  return (
    <Card className={styles.root} padding="none" variant="outlined">
      <div className={styles.media}>
        {product.badges.length > 0 ? (
          <span className={styles.badge}>
            <Badge>{product.badges[0]}</Badge>
          </span>
        ) : null}
        {overlayAction === undefined ? null : (
          <span className={styles.overlayAction}>{overlayAction}</span>
        )}
        <Link
          aria-label={`Открыть товар «${product.name}»`}
          className={styles.imageLink}
          onClick={() => {
            onProductOpen?.({ product, trigger: 'image' });
          }}
          to={`/product/${product.slug}`}
        >
          {product.thumbnail === null ? (
            <div className={styles.imagePlaceholder}>
              <ImageIcon />
            </div>
          ) : (
            <img
              alt={product.thumbnail.alt || product.name}
              decoding="async"
              height={product.thumbnail.height ?? undefined}
              loading="lazy"
              src={product.thumbnail.url}
              width={product.thumbnail.width ?? undefined}
            />
          )}
        </Link>
      </div>

      <div className={styles.content}>
        <div className={styles.identity}>
          <h3 className={styles.title}>
            <Link
              className={styles.titleLink}
              onClick={() => {
                onProductOpen?.({ product, trigger: 'title' });
              }}
              title={product.name}
              to={`/product/${product.slug}`}
            >
              {product.name}
            </Link>
          </h3>

          <div className={styles.differentiator}>
            {product.variantSummary === null ? null : (
              <p className={styles.variantSummary}>{product.variantSummary}</p>
            )}
          </div>
        </div>

        <div className={styles.specifications}>
          {visibleAttributes.length > 0 ? (
            <dl className={styles.attributeList}>
              {visibleAttributes.map((attr) => (
                <div className={styles.attrRow} key={attr.code}>
                  <dt className={styles.attrLabel}>{attr.name}</dt>
                  <dd className={styles.attrValue}>
                    {formatAttributeValue(attr)}
                    {attr.unit ? ` ${attr.unit}` : ''}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>

        <div className={styles.commerce}>
          <div aria-label="Цена и условия покупки" className={styles.priceBlock}>
            <span className={styles.priceValue}>{price.primary}</span>
            <span className={styles.priceUnit}>{price.unit}</span>
            {price.condition === null ? null : (
              <span className={styles.purchaseCondition}>{price.condition}</span>
            )}
          </div>
          <div className={styles.availability}>
            <ProductAvailability availability={product.availability} />
          </div>
          {action === undefined ? null : <div className={styles.action}>{action}</div>}
        </div>
      </div>
    </Card>
  );
}
