import { Link } from 'react-router';

import { ProductCard, useProductsQuery } from '@/entities/product';
import { ProductCardAddToCartButton } from '@/features/add-to-cart';
import { Container, Skeleton } from '@/shared/ui';

import styles from './home-featured-products.module.css';

export function HomeFeaturedProducts() {
  const productsQuery = useProductsQuery({ limit: 4, page: 1, sort: 'relevance' });

  if (productsQuery.isError || productsQuery.data?.items.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="featured-products-title" className={styles.section}>
      <Container size="wide">
        <div className={styles.heading}>
          <div>
            <h2 id="featured-products-title">Рекомендуемые товары</h2>
            <p>Начните с востребованных позиций из каталога BELT.</p>
          </div>
        </div>
        {productsQuery.isPending ? (
          <div
            aria-busy="true"
            aria-label="Загрузка рекомендуемых товаров"
            className={styles.grid}
            role="status"
          >
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton
                height="25rem"
                isDecorative
                key={index}
                label="Загрузка товара"
                variant="rectangle"
              />
            ))}
          </div>
        ) : null}
        {productsQuery.data === undefined ? null : (
          <div className={styles.grid}>
            {productsQuery.data.items.map((product) => (
              <ProductCard
                action={<ProductCardAddToCartButton product={product} />}
                key={product.id}
                product={product}
              />
            ))}
          </div>
        )}
        <div className={styles.catalogAction}>
          <Link className={styles.catalogLink} to="/catalog">
            <span>Открыть весь каталог</span>
            <span aria-hidden="true" className={styles.catalogArrow}>
              →
            </span>
          </Link>
        </div>
      </Container>
    </section>
  );
}
