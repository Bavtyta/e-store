import { Link } from 'react-router';

import type { ProductListItem } from '../model/product';
import { formatProductPrice } from '../model/formatProductPrice';
import { Badge, Card } from '@/shared/ui';

import styles from './product-card.module.css';

export interface ProductCardProps {
  product: ProductListItem;
}

function formatAttributeValue(value: ProductListItem['shortAttributes'][number]): string {
  if (value.value === true) return 'Да';
  if (value.value === false) return 'Нет';

  return String(value.value);
}

function getAvailabilityInfo(
  status: ProductListItem['availability']['status'],
  message: string | null,
): { text: string; cssClass: string } {
  const text = message ?? 'Наличие уточняется';
  const badgeStyles: Record<string, string> = {
    in_stock: styles.badgeSuccess ?? '',
    low_stock: styles.badgeWarning ?? '',
    out_of_stock: styles.badgeError ?? '',
    on_order: styles.badgeInfo ?? '',
  };

  switch (status) {
    case 'in_stock':
      return { text, cssClass: badgeStyles.in_stock ?? '' };
    case 'low_stock':
      return { text: 'Заканчивается', cssClass: badgeStyles.low_stock ?? '' };
    case 'out_of_stock':
      return { text: 'Нет в наличии', cssClass: badgeStyles.out_of_stock ?? '' };
    case 'on_order':
      return { text: 'Под заказ', cssClass: badgeStyles.on_order ?? '' };
    default:
      return { text, cssClass: badgeStyles.in_stock ?? '' };
  }
}

export function ProductCard({ product }: ProductCardProps) {
  const price = formatProductPrice(
    product.priceFrom,
    product.priceFrom === null ? 'on_request' : product.priceTo === null ? 'fixed' : 'from',
  );

  const availability = getAvailabilityInfo(product.availability.status, product.availability.message);

  return (
    <Card className={styles.root} padding="compact" variant="outlined">
      {/* Image */}
      <Link
        aria-label={`Открыть товар «${product.name}»`}
        className={styles.imageLink}
        to={`/product/${product.slug}`}
      >
        {product.badges.length > 0 ? (
          <span className={styles.badge}>
            <Badge>{product.badges[0]}</Badge>
          </span>
        ) : null}
        {product.thumbnail === null ? (
          <div className={styles.imagePlaceholder}>
            <svg
              aria-hidden="true"
              fill="none"
              height="48"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
              width="48"
            >
              <rect height="18" rx="2" width="18" x="3" y="3" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
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

      {/* Content */}
      <div className={styles.content}>
        <h3 className={styles.title}>
          <Link className={styles.titleLink} to={`/product/${product.slug}`}>
            {product.name}
          </Link>
        </h3>

        {product.shortAttributes.length > 0 ? (
          <div className={styles.attributes}>
            {product.shortAttributes.slice(0, 3).map((attr) => (
              <div className={styles.attrRow} key={attr.code}>
                <span className={styles.attrLabel}>{attr.name}:</span>
                <span className={styles.attrValue}>
                  {formatAttributeValue(attr)}
                  {attr.unit ? ` ${attr.unit}` : ''}
                </span>
              </div>
            ))}
          </div>
        ) : null}

        {/* Footer: price + cart */}
        <div className={styles.footer}>
          <div className={styles.priceBlock}>
            {product.primaryUnit ? (
              <span className={styles.priceUnit}>за {product.primaryUnit.label}</span>
            ) : null}
            <span className={styles.priceValue}>{price}</span>
          </div>
          <span className={[styles.availabilityBadge, availability.cssClass].join(' ')}>
            {availability.text}
          </span>
        </div>
      </div>
    </Card>
  );
}
