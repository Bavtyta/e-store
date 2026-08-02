import { Link } from 'react-router';

import { formatCartMoney } from '@/entities/cart';
import { ProductAvailability, ProductPrice } from '@/entities/product';
import { QuantityControl } from '@/features/change-cart-quantity';
import { RemoveFromCartButton } from '@/features/remove-from-cart';
import type { ResolvedCartLine } from '@/features/resolve-cart';
import { Card, ImagePlaceholder } from '@/shared/ui';

import styles from './cart-content.module.css';

export interface CartContentProps {
  lines: readonly ResolvedCartLine[];
}

function CartLine({ line }: { line: ResolvedCartLine }) {
  const resolved = line.resolved;
  const itemName = resolved?.product.name ?? `Вариант ${line.item.variantId}`;

  if (resolved === null) {
    return (
      <li>
        <Card className={styles.item} padding="compact">
          <ImagePlaceholder
            alt={`Изображение позиции «${itemName}» недоступно`}
            className={styles.image}
            ratio="square"
          />
          <div className={styles.details}>
            <h2>{itemName}</h2>
            <p className={styles.warning} role="status">
              Этот вариант больше не найден или снят с продажи. Он сохранён в корзине, пока вы не
              удалите его.
            </p>
            <p>Сохранённое количество: {line.item.quantity}</p>
            <RemoveFromCartButton itemName={itemName} variantId={line.item.variantId} />
          </div>
        </Card>
      </li>
    );
  }

  const { product, variant } = resolved;
  const hasImage = product.image !== null;
  const imageAlt =
    product.image === null || product.image.alt.trim().length === 0
      ? product.name
      : product.image.alt;

  return (
    <li>
      <Card className={styles.item} padding="compact">
        <Link
          aria-label={`Открыть товар «${product.name}»`}
          className={styles.imageLink}
          to={`/product/${product.slug}`}
        >
          {hasImage ? (
            <img
              alt={imageAlt}
              className={styles.image}
              decoding="async"
              height={product.image?.height ?? undefined}
              loading="lazy"
              src={product.image?.url}
              width={product.image?.width ?? undefined}
            />
          ) : (
            <ImagePlaceholder
              alt={`Изображение товара «${product.name}» отсутствует`}
              className={styles.image}
              ratio="square"
            />
          )}
        </Link>

        <div className={styles.details}>
          <header className={styles.heading}>
            <div>
              <h2>
                <Link to={`/product/${product.slug}`}>{product.name}</Link>
              </h2>
              <p>{variant.name}</p>
            </div>
            <RemoveFromCartButton itemName={product.name} variantId={variant.id} />
          </header>

          <dl className={styles.identity}>
            <div>
              <dt>Артикул</dt>
              <dd>{variant.sku}</dd>
            </div>
            <div>
              <dt>Единица измерения</dt>
              <dd>{variant.unit.label}</dd>
            </div>
          </dl>

          {variant.optionValues.length === 0 ? null : (
            <ul aria-label="Выбранные характеристики" className={styles.options}>
              {variant.optionValues.map((option) => (
                <li key={option.code}>{option.label}</li>
              ))}
            </ul>
          )}

          <div className={styles.commercial}>
            <ProductPrice variant={variant} />
            <ProductAvailability availability={variant.availability} />
          </div>

          {line.status === 'out-of-stock' ? (
            <p className={styles.warning} role="status">
              Вариант стал недоступен. Он не входит в итог и доступен только для удаления.
            </p>
          ) : line.status === 'invalid-quantity-rules' ? (
            <p className={styles.warning} role="status">
              Параметры продажи изменились. Количество нельзя изменить до уточнения данных.
            </p>
          ) : (
            <QuantityControl itemName={product.name} quantity={line.quantity} variant={variant} />
          )}

          <p className={styles.subtotal}>
            <span>Стоимость позиции</span>
            <strong>
              {line.lineTotalMinor === null
                ? 'Не включена в итог'
                : formatCartMoney(line.lineTotalMinor)}
            </strong>
          </p>
        </div>
      </Card>
    </li>
  );
}

export function CartContent({ lines }: CartContentProps) {
  return (
    <ul aria-label="Позиции корзины" className={styles.list}>
      {lines.map((line) => (
        <CartLine key={line.item.variantId} line={line} />
      ))}
    </ul>
  );
}
