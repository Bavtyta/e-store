import { Link } from 'react-router';

import { ProductCard, useProductsQuery } from '@/entities/product';
import { ProductCardAddToCartButton } from '@/features/add-to-cart';
import { FavoriteToggleButton } from '@/features/favorites';
import { ArrowRightIcon, Container, Skeleton } from '@/shared/ui';

import styles from './home-featured-products.module.css';

const FEATURED_PRODUCT_IMAGES: Readonly<Record<string, string>> = {
  'truba-pnd-pe100-pitevaya': '/images/home/products/truba-pnd.jpg',
  'truba-pvh-kanalizacionnaya-110': '/images/home/products/truba-pvh.jpg',
  'truba-polipropilenovaya-armirovannaya': '/images/home/products/truba-pp.jpg',
  'truba-stalnaya-elektrosvarnaya': '/images/home/products/truba-stal.jpg',
};

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
            <h2 id="featured-products-title">Товары из каталога</h2>
            <p>Посмотрите характеристики и доступные варианты товаров BELT.</p>
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
            {productsQuery.data.items.map((product) => {
              const imageUrl = FEATURED_PRODUCT_IMAGES[product.slug];
              const featuredProduct =
                imageUrl === undefined
                  ? product
                  : {
                      ...product,
                      thumbnail: {
                        alt: product.name,
                        height: 800,
                        id: `${product.id}-home-featured`,
                        sortOrder: 0,
                        url: imageUrl,
                        width: 800,
                      },
                    };

              return (
                <ProductCard
                  action={<ProductCardAddToCartButton product={product} />}
                  key={product.id}
                  overlayAction={<FavoriteToggleButton product={product} />}
                  product={featuredProduct}
                />
              );
            })}
          </div>
        )}
        <div className={styles.catalogAction}>
          <Link className={styles.catalogLink} to="/catalog">
            <span>Открыть весь каталог</span>
            <span aria-hidden="true" className={styles.catalogArrow}>
              <ArrowRightIcon />
            </span>
          </Link>
        </div>
      </Container>
    </section>
  );
}
