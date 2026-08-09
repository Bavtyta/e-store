import { useState } from 'react';

import { useCategoriesQuery } from '@/entities/category';
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
  const [hasProductsError, setHasProductsError] = useState(false);
  const hasPageError = categoriesQuery.isError || hasProductsError;

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
                    title="Не удалось загрузить категории"
                  />
                ) : null}
                {categoriesQuery.data === undefined ? null : (
                  <CatalogNavigation categories={categoriesQuery.data} />
                )}
                <div className={styles.filters}>
                  <h3 className={styles.filtersTitle}>Фильтры</h3>
                  <div className={styles.filterGroup}>
                    <span className={styles.filterLabel}>Цена, ₽</span>
                    <div className={styles.filterRow}>
                      <input
                        aria-label="Цена от"
                        className={styles.filterInput}
                        placeholder="От"
                        type="number"
                      />
                      <span className={styles.filterDash}>-</span>
                      <input
                        aria-label="Цена до"
                        className={styles.filterInput}
                        placeholder="До"
                        type="number"
                      />
                    </div>
                  </div>
                  <div className={styles.filterGroup}>
                    <label className={styles.filterLabel}>Диаметр, мм</label>
                    <div className={styles.filterChecks}>
                      <label className={styles.filterCheck}>
                        <input type="checkbox" />
                        <span>25</span>
                      </label>
                      <label className={styles.filterCheck}>
                        <input type="checkbox" />
                        <span>32</span>
                      </label>
                      <label className={styles.filterCheck}>
                        <input type="checkbox" />
                        <span>50</span>
                      </label>
                      <label className={styles.filterCheck}>
                        <input type="checkbox" />
                        <span>110</span>
                      </label>
                    </div>
                  </div>
                  <div className={styles.filterGroup}>
                    <label className={styles.filterLabel} htmlFor="catalog-material-filter">
                      Материал
                    </label>
                    <select className={styles.filterSelect} id="catalog-material-filter">
                      <option>Любой</option>
                      <option>ПНД (PE100)</option>
                      <option>ПВХ</option>
                      <option>Сталь</option>
                    </select>
                  </div>
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
