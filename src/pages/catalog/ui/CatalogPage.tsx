import { useState } from 'react';
import { useSearchParams } from 'react-router';

import { useCategoriesQuery } from '@/entities/category';
import {
  applyCatalogFilterChanges,
  CatalogFilterPanel,
  parseCatalogFilterState,
  removeCatalogFilterParams,
} from '@/features/catalog-filter';
import type { CatalogFilterState } from '@/features/catalog-filter';
import { appConfig } from '@/shared/config';
import { createPageMetadata, PageMetadata } from '@/shared/lib';
import { Breadcrumbs, Container, ErrorState, Skeleton } from '@/shared/ui';
import { CatalogContent } from '@/widgets/catalog-content';
import { CatalogNavigation } from '@/widgets/catalog-navigation';

import styles from './catalog-page.module.css';

const catalogMetadata = createPageMetadata(
  {
    canonicalPath: '/catalog',
    description:
      'Каталог строительных и промышленных материалов с характеристиками, вариантами и актуальным наличием.',
    title: 'Каталог строительных материалов',
  },
  appConfig.publicSiteUrl,
);

const catalogErrorMetadata = createPageMetadata(
  {
    canonicalPath: '/catalog',
    description: 'Каталог строительных и промышленных материалов временно не удалось загрузить.',
    indexable: false,
    title: 'Каталог строительных материалов',
  },
  appConfig.publicSiteUrl,
);

export function CatalogPage() {
  const categoriesQuery = useCategoriesQuery();
  const [searchParams, setSearchParams] = useSearchParams();
  const [hasProductsError, setHasProductsError] = useState(false);
  const hasPageError = categoriesQuery.isError || hasProductsError;
  const filterState = parseCatalogFilterState(searchParams);

  function handleFiltersChange(changes: Partial<CatalogFilterState>): void {
    const next = applyCatalogFilterChanges(searchParams, changes);
    next.delete('page');
    setSearchParams(next);
  }

  function handleResetFilters(): void {
    const next = removeCatalogFilterParams(searchParams);
    next.delete('page');
    setSearchParams(next);
  }

  return (
    <div className={styles.page}>
      <PageMetadata metadata={hasPageError ? catalogErrorMetadata : catalogMetadata} />
      <Container className={styles.content} size="wide">
        <Breadcrumbs items={[{ label: 'Каталог' }]} />
        <h1 className={styles.heading}>Каталог товаров</h1>
        <div className={styles.layout}>
          <aside className={styles.sidebar}>
            <details className={styles.sidebarInner} open>
              <summary className={styles.sidebarToggle}>
                Фильтры и категории
                <svg
                  aria-hidden="true"
                  className={styles.sidebarToggleIcon}
                  fill="none"
                  height="18"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="18"
                >
                  <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </summary>
              <div className={styles.sidebarBody}>
                <h2 className={styles.sidebarTitle}>Категории</h2>
                {categoriesQuery.isPending ? (
                  <Skeleton height="20rem" label="Загрузка категорий" variant="rectangle" />
                ) : null}
                {categoriesQuery.isError ? (
                  <ErrorState
                    onRetry={() => void categoriesQuery.refetch()}
                    retryLabel="Повторить загрузку категорий"
                    title="Не удалось загрузить категории"
                    variant="inline"
                  />
                ) : null}
                {categoriesQuery.data === undefined ? null : (
                  <CatalogNavigation categories={categoriesQuery.data} />
                )}
                <div className={styles.filters}>
                  <CatalogFilterPanel
                    onFiltersChange={handleFiltersChange}
                    onReset={handleResetFilters}
                    state={filterState}
                  />
                </div>
              </div>
            </details>
          </aside>
          <div className={styles.main}>
            <CatalogContent onQueryErrorChange={setHasProductsError} />
          </div>
        </div>
      </Container>
    </div>
  );
}
