import { Link } from 'react-router';

import { ProductCard, useProductsQuery } from '@/entities/product';
import { ProductCardAddToCartButton } from '@/features/add-to-cart';
import {
  FavoriteToggleButton,
  useFavoritesHydration,
  useFavoritesStore,
} from '@/features/favorites';
import { appConfig } from '@/shared/config';
import { createPageMetadata, PageMetadata } from '@/shared/lib';
import { Container, EmptyState, ErrorState, Skeleton } from '@/shared/ui';

import styles from './favorites-page.module.css';

const metadata = createPageMetadata(
  {
    canonicalPath: '/favorites',
    description: 'Товары, сохранённые в избранном на этом устройстве.',
    indexable: false,
    title: 'Избранное',
  },
  appConfig.publicSiteUrl,
);

export function FavoritesPage() {
  useFavoritesHydration();
  const productIds = useFavoritesStore((state) => state.productIds);
  const hasHydrated = useFavoritesStore((state) => state.hasHydrated);
  const query = useProductsQuery({ limit: 100, page: 1, sort: 'relevance' });
  const products = query.data?.items.filter((product) => productIds.includes(product.id)) ?? [];

  return (
    <Container className={styles.page} size="wide">
      <PageMetadata metadata={metadata} />
      <header className={styles.header}>
        <p className={styles.eyebrow}>Сохраняется на этом устройстве</p>
        <h1>Избранное</h1>
        <p>Соберите подходящие позиции, чтобы вернуться к сравнению позже.</p>
      </header>
      {!hasHydrated || query.isPending ? (
        <div aria-label="Загрузка избранного" className={styles.grid} role="status">
          <Skeleton height="24rem" isDecorative label="Загрузка товара" variant="rectangle" />
          <Skeleton height="24rem" isDecorative label="Загрузка товара" variant="rectangle" />
        </div>
      ) : null}
      {query.isError ? (
        <ErrorState
          description="Попробуйте загрузить сохранённые товары ещё раз."
          onRetry={() => {
            void query.refetch();
          }}
          retryLabel="Повторить"
          title="Не удалось загрузить избранное"
        />
      ) : null}
      {hasHydrated && query.isSuccess && products.length === 0 ? (
        <EmptyState
          action={
            <Link className={styles.catalogLink} to="/catalog">
              Перейти в каталог
            </Link>
          }
          description="Нажмите на сердечко в карточке товара, и он появится здесь."
          title="В избранном пока ничего нет"
        />
      ) : null}
      {products.length > 0 ? (
        <div className={styles.grid}>
          {products.map((product) => (
            <ProductCard
              action={<ProductCardAddToCartButton product={product} />}
              key={product.id}
              overlayAction={<FavoriteToggleButton product={product} />}
              product={product}
            />
          ))}
        </div>
      ) : null}
    </Container>
  );
}
