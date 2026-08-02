import { useCallback, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router';

import { productSortSchema, ProductCard, useProductsQuery } from '@/entities/product';
import type { ProductSort } from '@/entities/product';
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
  const query = useProductsQuery({
    ...(categoryPath === undefined ? {} : { category: categoryPath }),
    ...(search.length === 0 ? {} : { search }),
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
          title="Не удалось загрузить товары"
        />
      ) : null}
      {query.data?.items.length === 0 ? (
        <EmptyState
          action={
            search.length === 0 ? undefined : (
              <Button
                onClick={() => {
                  updateSearchParams({ page: null, search: null });
                }}
                variant="secondary"
              >
                Сбросить поиск
              </Button>
            )
          }
          description={
            search.length > 0
              ? 'Измените запрос или сбросьте поиск.'
              : 'В этой категории пока нет товаров.'
          }
          title={search.length > 0 ? 'Ничего не найдено' : 'Каталог пуст'}
        />
      ) : null}
      {query.data?.items.length ? (
        <>
          <p aria-live="polite" className={styles.total} role="status">
            Найдено товаров: {query.data.pagination.total}
          </p>
          <div className={styles.grid}>
            {query.data.items.map((product) => (
              <ProductCard key={product.id} product={product} />
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
