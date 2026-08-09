import type { ReactNode } from 'react';
import { Link, useParams } from 'react-router';

import { useProductQuery } from '@/entities/product';
import type { ProductDetails as ProductDetailsModel } from '@/entities/product';
import { useProductVariantSelection } from '@/features/select-product-variant';
import { AppError } from '@/shared/api';
import { appConfig } from '@/shared/config';
import { createPageMetadata, PageMetadata } from '@/shared/lib';
import type { PageMetadataDescriptor } from '@/shared/lib';
import { Breadcrumbs, Container, EmptyState, ErrorState, Skeleton } from '@/shared/ui';
import { ProductDetails } from '@/widgets/product-details';
import { ProductGallery } from '@/widgets/product-gallery';

import styles from './product-page.module.css';

interface ProductPageFrameProps {
  children: ReactNode;
  metadata: PageMetadataDescriptor;
}

const productLoadingMetadata = createPageMetadata(
  {
    canonicalPath: '/product',
    description: 'Загрузка информации о товаре.',
    indexable: false,
    title: 'Загрузка товара',
  },
  appConfig.publicSiteUrl,
);

const productNotFoundMetadata = createPageMetadata(
  {
    canonicalPath: '/product',
    description: 'Запрошенный товар не найден.',
    indexable: false,
    title: 'Товар не найден',
  },
  appConfig.publicSiteUrl,
);

const productErrorMetadata = createPageMetadata(
  {
    canonicalPath: '/product',
    description: 'Не удалось загрузить информацию о товаре.',
    indexable: false,
    title: 'Ошибка загрузки товара',
  },
  appConfig.publicSiteUrl,
);

function createProductMetadata(product: ProductDetailsModel): PageMetadataDescriptor {
  const primaryImage =
    [...product.images].sort((first, second) => first.sortOrder - second.sortOrder)[0] ?? null;

  return createPageMetadata(
    {
      canonicalPath: product.seo.canonicalUrl ?? `/product/${product.slug}`,
      description:
        product.seo.description ??
        product.description ??
        `Характеристики, варианты и наличие товара «${product.name}».`,
      imageUrl: primaryImage?.url ?? null,
      indexable: product.seo.indexable,
      openGraphType: 'product',
      title: product.seo.title ?? product.name,
    },
    appConfig.publicSiteUrl,
  );
}

function ProductPageFrame({ children, metadata }: ProductPageFrameProps) {
  return (
    <div className={styles.page}>
      <PageMetadata metadata={metadata} />
      <Container className={styles.content}>{children}</Container>
    </div>
  );
}

function ProductPageSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Загрузка страницы товара"
      aria-live="polite"
      className={styles.skeleton}
      role="status"
    >
      <Skeleton height="1.25rem" isDecorative label="Загрузка навигации" width="16rem" />
      <div className={styles.skeletonGrid}>
        <Skeleton height="30rem" isDecorative label="Загрузка изображений" variant="rectangle" />
        <Skeleton
          height="36rem"
          isDecorative
          label="Загрузка информации о товаре"
          variant="rectangle"
        />
      </div>
    </div>
  );
}

function LoadedProductPage({ product }: { product: ProductDetailsModel }) {
  const selection = useProductVariantSelection(product.variants);

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Каталог', to: '/catalog' },
          { label: product.category.name, to: product.category.path },
          { label: product.name },
        ]}
      />
      <div className={styles.productGrid}>
        <ProductGallery
          images={product.images}
          key={selection.selectedVariant?.imageId ?? product.id}
          productName={product.name}
          selectedImageId={selection.selectedVariant?.imageId ?? null}
        />
        <ProductDetails
          isOptionAvailable={selection.isOptionAvailable}
          onOptionSelect={selection.selectOption}
          product={product}
          selectedOptions={selection.selectedOptions}
          selectedVariant={selection.selectedVariant}
        />
      </div>
    </>
  );
}

export function ProductPage() {
  const { productSlug } = useParams();
  const productQuery = useProductQuery(productSlug ?? '');

  if (productSlug === undefined || productSlug.length === 0) {
    return (
      <ProductPageFrame metadata={productNotFoundMetadata}>
        <EmptyState
          action={<Link to="/catalog">Перейти в каталог</Link>}
          description="Проверьте адрес страницы и попробуйте снова."
          title="Товар не найден"
        />
      </ProductPageFrame>
    );
  }

  if (productQuery.isPending) {
    return (
      <ProductPageFrame metadata={productLoadingMetadata}>
        <ProductPageSkeleton />
      </ProductPageFrame>
    );
  }

  if (productQuery.isError) {
    if (productQuery.error instanceof AppError && productQuery.error.kind === 'not-found') {
      return (
        <ProductPageFrame metadata={productNotFoundMetadata}>
          <EmptyState
            action={<Link to="/catalog">Вернуться в каталог</Link>}
            description="Возможно, товар был удалён или перемещён."
            title="Товар не найден"
          />
        </ProductPageFrame>
      );
    }

    return (
      <ProductPageFrame metadata={productErrorMetadata}>
        <ErrorState
          action={<Link to="/catalog">Перейти в каталог</Link>}
          description="Проверьте подключение и попробуйте открыть товар ещё раз."
          onRetry={() => {
            void productQuery.refetch();
          }}
          title="Не удалось загрузить товар"
        />
      </ProductPageFrame>
    );
  }

  return (
    <ProductPageFrame metadata={createProductMetadata(productQuery.data)}>
      <LoadedProductPage key={productQuery.data.id} product={productQuery.data} />
    </ProductPageFrame>
  );
}
