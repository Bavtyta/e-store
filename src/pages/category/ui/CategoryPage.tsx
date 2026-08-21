import { useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useParams } from 'react-router';

import { useCategoryQuery } from '@/entities/category';
import type { Category } from '@/entities/category';
import { AppError } from '@/shared/api';
import { appConfig } from '@/shared/config';
import { createPageMetadata, PageMetadata } from '@/shared/lib';
import type { PageMetadataDescriptor } from '@/shared/lib';
import { Container, EmptyState, ErrorState, Skeleton } from '@/shared/ui';
import { CategoryCatalogContent } from '@/widgets/catalog-content';

import styles from './category-page.module.css';

interface CategoryPageFrameProps {
  children: ReactNode;
  metadata: PageMetadataDescriptor;
}

const categoryLoadingMetadata = createPageMetadata(
  {
    canonicalPath: '/catalog',
    description: 'Загрузка категории материалов.',
    indexable: false,
    title: 'Загрузка категории',
  },
  appConfig.publicSiteUrl,
);

const categoryNotFoundMetadata = createPageMetadata(
  {
    canonicalPath: '/catalog',
    description: 'Запрошенная категория не найдена.',
    indexable: false,
    title: 'Категория не найдена',
  },
  appConfig.publicSiteUrl,
);

const categoryErrorMetadata = createPageMetadata(
  {
    canonicalPath: '/catalog',
    description: 'Не удалось загрузить категорию материалов.',
    indexable: false,
    title: 'Ошибка загрузки категории',
  },
  appConfig.publicSiteUrl,
);

function createCategoryMetadata(
  category: Category,
  hasProductsError: boolean,
): PageMetadataDescriptor {
  return createPageMetadata(
    {
      canonicalPath: category.seo.canonicalUrl ?? category.path,
      description:
        category.seo.description ??
        category.description ??
        `Материалы категории «${category.name}»: характеристики, варианты и наличие.`,
      imageUrl: category.image?.url ?? null,
      indexable: category.seo.indexable && !hasProductsError,
      title: category.seo.title ?? category.name,
    },
    appConfig.publicSiteUrl,
  );
}

function CategoryPageFrame({ children, metadata }: CategoryPageFrameProps) {
  return (
    <div className={styles.page}>
      <PageMetadata metadata={metadata} />
      <Container className={styles.content}>{children}</Container>
    </div>
  );
}

export function CategoryPage() {
  const { '*': categoryPath } = useParams();
  const [hasProductsError, setHasProductsError] = useState(false);
  const normalizedCategoryPath = categoryPath ?? '';
  const categoryQuery = useCategoryQuery(normalizedCategoryPath);

  if (normalizedCategoryPath.length === 0) {
    return (
      <CategoryPageFrame metadata={categoryNotFoundMetadata}>
        <EmptyState
          action={<Link to="/catalog">Перейти в каталог</Link>}
          description="Выберите категорию в общем каталоге."
          title="Категория не выбрана"
        />
      </CategoryPageFrame>
    );
  }

  if (categoryQuery.isPending) {
    return (
      <CategoryPageFrame metadata={categoryLoadingMetadata}>
        <Skeleton height="24rem" label="Загрузка категории" variant="rectangle" />
      </CategoryPageFrame>
    );
  }

  if (categoryQuery.isError) {
    if (categoryQuery.error instanceof AppError && categoryQuery.error.kind === 'not-found') {
      return (
        <CategoryPageFrame metadata={categoryNotFoundMetadata}>
          <EmptyState
            action={<Link to="/catalog">Вернуться в каталог</Link>}
            description="Проверьте адрес или выберите другую категорию."
            title="Категория не найдена"
          />
        </CategoryPageFrame>
      );
    }

    return (
      <CategoryPageFrame metadata={categoryErrorMetadata}>
        <ErrorState
          action={<Link to="/catalog">Перейти в каталог</Link>}
          description="Проверьте подключение и попробуйте открыть категорию ещё раз."
          onRetry={() => {
            void categoryQuery.refetch();
          }}
          title="Не удалось загрузить категорию"
        />
      </CategoryPageFrame>
    );
  }

  return (
    <CategoryPageFrame metadata={createCategoryMetadata(categoryQuery.data, hasProductsError)}>
      <CategoryCatalogContent
        category={categoryQuery.data}
        categoryPath={normalizedCategoryPath}
        onProductsErrorChange={setHasProductsError}
      />
    </CategoryPageFrame>
  );
}
