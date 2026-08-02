import { Link } from 'react-router';

import type { ProductListItem } from '../model/product';
import { formatProductPrice } from '../model/formatProductPrice';
import { Badge, Card, ImagePlaceholder } from '@/shared/ui';

import styles from './product-card.module.css';

export interface ProductCardProps {
  product: ProductListItem;
}

function formatAttributeValue(value: ProductListItem['shortAttributes'][number]): string {
  const displayedValue =
    value.value === true ? 'Да' : value.value === false ? 'Нет' : String(value.value);

  return value.unit === null
    ? `${value.name}: ${displayedValue}`
    : `${value.name}: ${displayedValue} ${value.unit}`;
}

export function ProductCard({ product }: ProductCardProps) {
  const availabilityText = product.availability.message ?? 'Наличие уточняется';
  const price = formatProductPrice(
    product.priceFrom,
    product.priceFrom === null ? 'on_request' : product.priceTo === null ? 'fixed' : 'from',
  );

  return (
    <Card className={styles.root} padding="compact" variant="outlined">
      <Link
        aria-label={`Открыть товар «${product.name}»`}
        className={styles.imageLink}
        to={`/product/${product.slug}`}
      >
        {product.thumbnail === null ? (
          <ImagePlaceholder alt={`Изображение товара «${product.name}» отсутствует`} />
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
      <div className={styles.content}>
        <div className={styles.badges}>
          {product.badges.map((badge) => (
            <Badge key={badge}>{badge}</Badge>
          ))}
        </div>
        <h2>
          <Link to={`/product/${product.slug}`}>{product.name}</Link>
        </h2>
        {product.shortAttributes.length > 0 ? (
          <ul className={styles.attributes}>
            {product.shortAttributes.slice(0, 3).map((attribute) => (
              <li key={attribute.code}>{formatAttributeValue(attribute)}</li>
            ))}
          </ul>
        ) : null}
        <p className={styles.price}>{price}</p>
        {product.primaryUnit === null ? null : (
          <p className={styles.unit}>за {product.primaryUnit.label}</p>
        )}
        <p className={styles.availability} data-status={product.availability.status}>
          {availabilityText}
        </p>
      </div>
    </Card>
  );
}
