import { useCallback, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router';

import { productSortSchema, ProductCard, useProductsQuery } from '@/entities/product';
import type { ProductSort } from '@/entities/product';
import { ProductCardAddToCartButton } from '@/features/add-to-cart';
import { createProductFilterParams, parseCatalogFilterState, removeCatalogFilterParams } from '@/features/catalog-filter';
import { ProductSearch } from '@/features/product-search';
import { ProductSorting } from '@/features/product-sorting';
import { Button, EmptyState, ErrorState, Pagination, Skeleton } from '@/shared/ui';

import styles from './catalog-content.module.css';

export interface CatalogContentProps {
  categoryPath?: string;
  onQueryErrorChange?: (hasError: boolean) => void;
}

function getPage(value: string | null): number {
  const page = Number(value);

  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

function getSort(value: string | null): ProductSort {
  const result = productSortSchema.safeParse(value);

  return result.success ? result.data : 'relevance';
}

export function CatalogContent({ categoryPath, onQueryErrorChange }: CatalogContentProps) {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') ?? '';
  const sort = getSort(searchParams.get('sort'));
  const page = getPage(searchParams.get('page'));
  const filterState = parseCatalogFilterState(searchParams);
  const hasActiveFilters =
    filterState.diameters.length > 0 ||
    filterState.material !== null ||
    filterState.priceMin !== null ||
    filterState.priceMax !== null;
  const query = useProductsQuery({
    ...(categoryPath === undefined ? {} : { category: categoryPath }),
    ...(search.length === 0 ? {} : { search }),
    ...createProductFilterParams(filterState),
    limit: 12,
    page,
    sort,
  });

  useEffect(() => {
    onQueryErrorChange?.(query.isError);
  }, [onQueryErrorChange, query.isError]);

  const updateSearchParams = useCallback(
    (changes: Readonly<Record<string, string | null>>) => {
      const next = new URLSearchParams(searchParams);

      for (const [key, value] of Object.entries(changes)) {
        if (value === null || value.length === 0) {
          next.delete(key);
        } else {
          next.set(key, value);
        }
      }

      setSearchParams(next);
    },
    [searchParams, setSearchParams],
  );

  const createPageHref = useCallback(
    (nextPage: number) => {
      const next = new URLSearchParams(searchParams);
      next.set('page', String(nextPage));

      return `${location.pathname}?${next.toString()}`;
    },
    [location.pathname, searchParams],
  );

  return (
    <section aria-label="Товары каталога" className={styles.root}>
      <div className={styles.controls}>
        <ProductSearch
          onSearchChange={(value) => {
            updateSearchParams({ page: null, search: value.trim() || null });
          }}
          value={search}
        />
        <ProductSorting
          onSortChange={(value) => {
            updateSearchParams({ page: null, sort: value });
          }}
          value={sort}
        />
      </div>

      {query.isPending ? <CatalogSkeleton /> : null}
      {query.isError ? (
        <ErrorState
          description="Попробуйте обновить список ещё раз."
          onRetry={() => {
            void query.refetch();
          }}
          retryLabel="Повторить загрузку товаров"
          title="Не удалось загрузить товары"
          variant="inline"
        />
      ) : null}
      {query.data?.items.length === 0 ? (
        <EmptyState
          action={
            search.length === 0 && !hasActiveFilters ? undefined : (
              <Button
                onClick={() => {
                  const next = removeCatalogFilterParams(searchParams);
                  next.delete('page');
                  next.delete('search');
                  setSearchParams(next);
                }}
                variant="secondary"
              >
                Сбросить поиск и фильтры
              </Button>
            )
          }
          description={
            search.length > 0 || hasActiveFilters
              ? 'Измените запрос или сбросьте поиск и фильтры.'
              : 'В этой категории пока нет товаров.'
          }
          title="Ничего не найдено"
          variant="inline"
        />
      ) : null}
      {query.data?.items.length ? (
        <>
          <p aria-live="polite" className={styles.total} role="status">
            Найдено товаров: {query.data.pagination.total}
          </p>
          <div className={styles.grid}>
            {query.data.items.map((product) => (
              <ProductCard
                action={<ProductCardAddToCartButton product={product} />}
                key={product.id}
                product={product}
              />
            ))}
          </div>
          <Pagination
            createPageHref={createPageHref}
            currentPage={query.data.pagination.page}
            totalPages={query.data.pagination.totalPages}
          />
        </>
      ) : null}
    </section>
  );
}

function CatalogSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Загрузка товаров"
      aria-live="polite"
      className={styles.grid}
      role="status"
    >
      {Array.from({ length: 8 }, (_, index) => (
        <Skeleton
          height="22rem"
          isDecorative
          key={index}
          label="Загрузка товара"
          variant="rectangle"
        />
      ))}
    </div>
  );
}
