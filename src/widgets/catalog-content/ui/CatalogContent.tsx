import { useCallback, useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';
import { useLocation, useSearchParams } from 'react-router';

import { productSortSchema, ProductCard, useProductsQuery } from '@/entities/product';
import type { ProductFacet, ProductSort } from '@/entities/product';
import { ProductCardAddToCartButton } from '@/features/add-to-cart';
import { useCatalogAnalytics } from '@/features/catalog-analytics';
import type { CatalogAnalyticsContext } from '@/features/catalog-analytics';
import { FavoriteToggleButton } from '@/features/favorites';
import {
  createProductFilterParams,
  getCatalogFilterCounts,
  ActiveFilterSummary,
  applyCatalogFilterChanges,
  parseCatalogAttributeFilters,
  parseCatalogFacetSelections,
  parseCatalogFilterState,
  removeCatalogFilterParams,
} from '@/features/catalog-filter';
import { interpretProductSearch, ProductSearch } from '@/features/product-search';
import { ProductSorting } from '@/features/product-sorting';
import { ErrorState, Pagination, Skeleton } from '@/shared/ui';

import type { CatalogEmptyBrowseTarget } from '../model/catalogEmptyState';
import { getCatalogEmptyReason } from '../model/catalogEmptyState';
import { CatalogEmptyState } from './CatalogEmptyState';
import styles from './catalog-content.module.css';

export interface CatalogContentProps {
  analyticsContext?: CatalogAnalyticsContext;
  categoryPath?: string;
  emptyBrowseTarget?: CatalogEmptyBrowseTarget;
  facets?: readonly ProductFacet[];
  filterControl?: ReactNode;
  onFacetsChange?: (facets: readonly ProductFacet[] | undefined) => void;
  onQueryErrorChange?: (hasError: boolean) => void;
  showSearch?: boolean;
  sortingMode?: 'always' | 'desktop';
}

function getStaticFilterSelectionCount(
  state: ReturnType<typeof parseCatalogFilterState>,
  code: 'diameter' | 'material' | 'price',
): number {
  if (code === 'diameter') return state.diameters.length;
  if (code === 'material') return state.materials.length;

  return Number(state.priceMin !== null) + Number(state.priceMax !== null);
}

function getPage(value: string | null): number {
  const page = Number(value);

  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

function getSort(value: string | null): ProductSort {
  const result = productSortSchema.safeParse(value);

  return result.success ? result.data : 'relevance';
}

export function CatalogContent({
  analyticsContext,
  categoryPath,
  emptyBrowseTarget,
  facets,
  filterControl,
  onFacetsChange,
  onQueryErrorChange,
  showSearch = true,
  sortingMode = 'always',
}: CatalogContentProps) {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const resultsHeadingId = useId();
  const catalogAnalytics = useCatalogAnalytics(
    analyticsContext ?? {
      categoryId: null,
      surface: categoryPath === undefined ? 'catalog' : 'category',
    },
  );
  const lastResultsEventKey = useRef<string | null>(null);
  const search = searchParams.get('search') ?? '';
  const sort = getSort(searchParams.get('sort'));
  const page = getPage(searchParams.get('page'));
  const filterState = parseCatalogFilterState(searchParams);
  const attributeFilters = parseCatalogAttributeFilters(searchParams);
  const facetSelections = parseCatalogFacetSelections(searchParams);
  const productFilterParams = createProductFilterParams(filterState);
  const hasActiveFilters =
    Object.keys(attributeFilters).length > 0 ||
    filterState.priceMin !== null ||
    filterState.priceMax !== null;
  const query = useProductsQuery({
    ...(categoryPath === undefined ? {} : { category: categoryPath }),
    ...(search.length === 0 ? {} : { search }),
    filters: attributeFilters,
    ...(productFilterParams.priceMin === undefined
      ? {}
      : { priceMin: productFilterParams.priceMin }),
    ...(productFilterParams.priceMax === undefined
      ? {}
      : { priceMax: productFilterParams.priceMax }),
    limit: 12,
    page,
    sort,
  });
  const displayedFacets = query.data?.facets ?? facets;
  const filterCounts = getCatalogFilterCounts(facetSelections, filterState);
  const emptyReason = getCatalogEmptyReason({
    hasCategory: categoryPath !== undefined,
    hasFilters: hasActiveFilters,
    hasSearch: search.length > 0,
  });
  const resolvedEmptyBrowseTarget: CatalogEmptyBrowseTarget | undefined =
    emptyReason === 'search' && categoryPath === undefined
      ? {
          action: 'view_all_catalog',
          label: 'Смотреть весь каталог',
          to: '/catalog',
        }
      : emptyBrowseTarget;

  useEffect(() => {
    onQueryErrorChange?.(query.isError);
  }, [onQueryErrorChange, query.isError]);

  useEffect(() => {
    if (query.data?.facets !== undefined) {
      onFacetsChange?.(query.data.facets);
    }
  }, [onFacetsChange, query.data?.facets]);

  useEffect(() => {
    if (query.data === undefined) {
      return;
    }

    const eventKey = [
      location.pathname,
      searchParams.toString(),
      query.data.pagination.page,
      query.data.pagination.total,
    ].join('|');

    if (lastResultsEventKey.current === eventKey) {
      return;
    }

    lastResultsEventKey.current = eventKey;
    catalogAnalytics.trackResultsViewed({
      emptyReason: query.data.items.length === 0 ? emptyReason : 'none',
      filterGroupCount: filterCounts.groupCount,
      filterValueCount: filterCounts.valueCount,
      hasSearch: search.length > 0,
      page: query.data.pagination.page,
      queryLength: search.trim().length,
      resultCount: query.data.pagination.total,
      sort,
    });
  }, [
    catalogAnalytics,
    emptyReason,
    filterCounts.groupCount,
    filterCounts.valueCount,
    location.pathname,
    query.data,
    search,
    searchParams,
    sort,
  ]);

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

  function handleSummaryFiltersChange(changes: Readonly<Partial<typeof filterState>>): void {
    const next = applyCatalogFilterChanges(searchParams, changes);
    next.delete('page');
    const nextState = parseCatalogFilterState(next);
    const code =
      changes.diameters === undefined
        ? changes.materials === undefined
          ? 'price'
          : 'material'
        : 'diameter';
    const previousCount = getStaticFilterSelectionCount(filterState, code);
    const selectedCount = getStaticFilterSelectionCount(nextState, code);

    setSearchParams(next);
    const trackChange =
      selectedCount < previousCount
        ? catalogAnalytics.trackFilterRemoved
        : catalogAnalytics.trackFilterApplied;
    trackChange({ filterCode: code, interaction: 'summary', selectedCount });
  }

  function handleSummaryFacetChange(code: string, values: readonly string[]): void {
    const next = new URLSearchParams(searchParams);
    const key = `filter[${code}]`;

    if (values.length === 0) {
      next.delete(key);
    } else {
      next.set(key, values.join(','));
    }
    next.delete('page');
    setSearchParams(next);
    const previousCount = facetSelections[code]?.length ?? 0;
    const trackChange =
      values.length < previousCount
        ? catalogAnalytics.trackFilterRemoved
        : catalogAnalytics.trackFilterApplied;
    trackChange({ filterCode: code, interaction: 'summary', selectedCount: values.length });
  }

  function clearFilters(): void {
    const next = removeCatalogFilterParams(searchParams);
    next.delete('page');
    setSearchParams(next);
  }

  function clearSearch(): void {
    const next = new URLSearchParams(searchParams);
    next.delete('page');
    next.delete('search');
    setSearchParams(next);
  }

  return (
    <section aria-labelledby={resultsHeadingId} className={styles.root}>
      <h2 className={styles.visuallyHidden} id={resultsHeadingId}>
        Товары каталога
      </h2>

      {showSearch ? (
        <div className={styles.searchRow}>
          <ProductSearch
            onSearchSubmit={(value) => {
              const interpretation = interpretProductSearch(value, displayedFacets);
              const next = removeCatalogFilterParams(searchParams);

              next.delete('page');
              if (interpretation.query.length === 0) {
                next.delete('search');
              } else {
                next.set('search', interpretation.query);
              }
              for (const [code, values] of Object.entries(interpretation.facetSelections)) {
                next.set(`filter[${code}]`, values.join(','));
              }
              setSearchParams(next);
              catalogAnalytics.trackSearchSubmitted({
                queryLength: value.trim().length,
                recognizedFilterCount: Object.values(interpretation.facetSelections).reduce(
                  (total, values) => total + values.length,
                  0,
                ),
              });
            }}
            value={search}
          />
        </div>
      ) : null}

      <div className={styles.resultsToolbar}>
        {query.data === undefined ? (
          <span className={styles.total}>Товары</span>
        ) : (
          <p aria-live="polite" className={styles.total}>
            Найдено товаров: {query.data.pagination.total}
          </p>
        )}
        {filterControl === undefined ? null : (
          <div className={styles.filterControl}>{filterControl}</div>
        )}
        {query.data?.items.length === 0 ? null : (
          <div
            className={[styles.sorting, sortingMode === 'desktop' ? styles.sortingDesktopOnly : '']
              .join(' ')
              .trim()}
          >
            <ProductSorting
              onSortChange={(value) => {
                updateSearchParams({ page: null, sort: value });
                catalogAnalytics.trackSortChanged({ interaction: 'toolbar', sort: value });
              }}
              value={sort}
            />
          </div>
        )}
      </div>

      <ActiveFilterSummary
        facetSelections={facetSelections}
        {...(displayedFacets === undefined ? {} : { facets: displayedFacets })}
        onFacetChange={handleSummaryFacetChange}
        onFiltersChange={handleSummaryFiltersChange}
        onReset={() => {
          catalogAnalytics.trackFiltersReset({
            interaction: 'summary',
            previousFilterGroupCount: filterCounts.groupCount,
            previousFilterValueCount: filterCounts.valueCount,
          });
          clearFilters();
        }}
        state={filterState}
      />

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
        <CatalogEmptyState
          {...(resolvedEmptyBrowseTarget === undefined
            ? {}
            : { browseTarget: resolvedEmptyBrowseTarget })}
          onClearFilters={() => {
            catalogAnalytics.trackFiltersReset({
              interaction: 'empty_state',
              previousFilterGroupCount: filterCounts.groupCount,
              previousFilterValueCount: filterCounts.valueCount,
            });
            clearFilters();
          }}
          onClearSearch={clearSearch}
          onRecoverySelected={(action) => {
            catalogAnalytics.trackRecoverySelected({ action, emptyReason });
          }}
          reason={emptyReason}
        />
      ) : null}
      {query.data?.items.length ? (
        <>
          <div className={styles.grid}>
            {query.data.items.map((product, index) => {
              const position =
                (query.data.pagination.page - 1) * query.data.pagination.limit + index + 1;

              return (
                <ProductCard
                  action={
                    <ProductCardAddToCartButton
                      onAdded={({ productId, quantity, variantId }) => {
                        catalogAnalytics.trackAddToCart({
                          page: query.data.pagination.page,
                          position,
                          productId,
                          quantity,
                          variantId,
                        });
                      }}
                      onVariantSelectionRequested={({ productId }) => {
                        catalogAnalytics.trackVariantSelectionRequested({
                          page: query.data.pagination.page,
                          position,
                          productId,
                          variantCount: product.variantCount,
                        });
                      }}
                      product={product}
                    />
                  }
                  key={product.id}
                  onProductOpen={({ product: openedProduct, trigger }) => {
                    catalogAnalytics.trackProductOpened({
                      page: query.data.pagination.page,
                      position,
                      productId: openedProduct.id,
                      trigger,
                    });
                  }}
                  overlayAction={<FavoriteToggleButton product={product} />}
                  product={product}
                />
              );
            })}
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
        <div className={styles.cardSkeleton} key={index}>
          <Skeleton
            className={styles.cardSkeletonMedia}
            height="10rem"
            isDecorative
            label="Загрузка изображения товара"
            variant="rectangle"
          />
          <div className={styles.cardSkeletonBody}>
            <div className={styles.cardSkeletonGroup}>
              <Skeleton height="1rem" isDecorative width="92%" />
              <Skeleton isDecorative width="72%" />
              <Skeleton isDecorative width="84%" />
            </div>
            <div className={styles.cardSkeletonSpecifications}>
              <Skeleton isDecorative width="100%" />
              <Skeleton isDecorative width="88%" />
            </div>
            <div className={styles.cardSkeletonCommerce}>
              <Skeleton height="1.25rem" isDecorative width="48%" />
              <Skeleton isDecorative width="38%" />
              <Skeleton isDecorative width="78%" />
              <Skeleton height="1.75rem" isDecorative width="42%" />
              <Skeleton
                className={styles.cardSkeletonAction}
                height="2.75rem"
                isDecorative
                width="100%"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
