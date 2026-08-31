import { Link } from 'react-router';

import { ProductCard, useProductsQuery } from '@/entities/product';
import { ProductCardAddToCartButton } from '@/features/add-to-cart';
import { FavoriteToggleButton } from '@/features/favorites';
import {
  ArrowRightIcon,
  CollectionShowcase,
  CollectionShowcaseGrid,
  CollectionShowcaseSkeleton,
  CollectionShowcaseState,
} from '@/shared/ui';

import styles from './home-featured-products.module.css';

const FEATURED_PRODUCT_IMAGES: Readonly<Record<string, string>> = {
  'truba-pnd-pe100-pitevaya': '/images/home/products/truba-pnd.jpg',
  'truba-pvh-kanalizacionnaya-110': '/images/home/products/truba-pvh.jpg',
  'truba-polipropilenovaya-armirovannaya': '/images/home/products/truba-pp.jpg',
  'truba-stalnaya-elektrosvarnaya': '/images/home/products/truba-stal.jpg',
};

export function HomeFeaturedProducts() {
  const productsQuery = useProductsQuery({ limit: 4, page: 1, sort: 'relevance' });

  return (
    <CollectionShowcase
      action={
        <Link className={styles.catalogLink} to="/catalog">
          <span>Открыть весь каталог</span>
          <span aria-hidden="true" className={styles.catalogArrow}>
            <ArrowRightIcon />
          </span>
        </Link>
      }
      description="Посмотрите характеристики и доступные варианты товаров BELT."
      title="Товары из каталога"
      titleId="featured-products-title"
    >
      {productsQuery.isPending ? <CollectionShowcaseSkeleton /> : null}
      {productsQuery.isError ? (
        <CollectionShowcaseState isError>
          <p>Не удалось загрузить товары. Каталог остаётся доступен по ссылке ниже.</p>
        </CollectionShowcaseState>
      ) : null}
      {productsQuery.data?.items.length === 0 ? (
        <CollectionShowcaseState>
          <p>В этом блоке появятся товары из каталога.</p>
        </CollectionShowcaseState>
      ) : null}
      {productsQuery.data === undefined || productsQuery.data.items.length === 0 ? null : (
        <CollectionShowcaseGrid>
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
        </CollectionShowcaseGrid>
      )}
    </CollectionShowcase>
  );
}
