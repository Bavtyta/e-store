import { useState } from 'react';

import { useCategoriesQuery } from '@/entities/category';
import { appConfig } from '@/shared/config';
import { createPageMetadata, PageMetadata } from '@/shared/lib';
import { Breadcrumbs, Container, ErrorState, Skeleton } from '@/shared/ui';
import { CatalogContent } from '@/widgets/catalog-content';
import { CatalogNavigation } from '@/widgets/catalog-navigation';
import { Footer } from '@/widgets/footer';
import { Header } from '@/widgets/header';

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
      <Header />
      <main id="main-content" tabIndex={-1}>
        <Container className={styles.content}>
          <Breadcrumbs items={[{ label: 'Каталог' }]} />
          <h1>Каталог материалов</h1>
          <div className={styles.layout}>
            <aside>
              <h2>Категории</h2>
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
            </aside>
            <CatalogContent onQueryErrorChange={setHasProductsError} />
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
