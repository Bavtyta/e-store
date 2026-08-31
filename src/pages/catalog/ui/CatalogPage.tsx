import { useState } from 'react';
import type { ReactNode } from 'react';
import { useSearchParams } from 'react-router';

import { useCategoriesQuery } from '@/entities/category';
import { productSortSchema, useProductsQuery } from '@/entities/product';
import type { ProductFacet, ProductSort } from '@/entities/product';
import { useCatalogAnalytics } from '@/features/catalog-analytics';
import {
  applyCatalogFilterChanges,
  CatalogFilterPanel,
  createProductFilterParams,
  getCatalogFilterCounts,
  parseCatalogAttributeFilters,
  parseCatalogFacetSelections,
  parseCatalogFilterState,
  removeCatalogFilterParams,
} from '@/features/catalog-filter';
import type { CatalogFilterState } from '@/features/catalog-filter';
import { ProductSorting } from '@/features/product-sorting';
import { appConfig } from '@/shared/config';
import { createPageMetadata, PageMetadata } from '@/shared/lib';
import { Button, Container, Dialog, ErrorState, Skeleton } from '@/shared/ui';
import { CatalogContent } from '@/widgets/catalog-content';
import { CatalogNavigation } from '@/widgets/catalog-navigation';

import styles from './catalog-page.module.css';

const catalogMetadata = createPageMetadata(
  {
    canonicalPath: '/catalog',
    description:
      'Каталог строительных и промышленных материалов с характеристиками и вариантами исполнения.',
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

function getSort(value: string | null): ProductSort {
  const result = productSortSchema.safeParse(value);

  return result.success ? result.data : 'relevance';
}

function getStaticFilterSelectionCount(
  state: CatalogFilterState,
  code: 'diameter' | 'material' | 'price',
): number {
  if (code === 'diameter') return state.diameters.length;
  if (code === 'material') return state.materials.length;

  return Number(state.priceMin !== null) + Number(state.priceMax !== null);
}

function haveSameFacetValues(first: readonly string[], second: readonly string[]): boolean {
  return first.length === second.length && first.every((value) => second.includes(value));
}

function formatShowProductsLabel(total: number | undefined): string {
  if (total === undefined) {
    return 'Показать товары';
  }

  return `Показать ${String(total)}`;
}

export function CatalogPage() {
  const categoriesQuery = useCategoriesQuery();
  const [searchParams, setSearchParams] = useSearchParams();
  const [hasProductsError, setHasProductsError] = useState(false);
  const [facets, setFacets] = useState<readonly ProductFacet[] | undefined>(undefined);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [mobileDraftParams, setMobileDraftParams] = useState<URLSearchParams | null>(null);
  const catalogAnalytics = useCatalogAnalytics({ categoryId: null, surface: 'catalog' });
  const hasPageError = categoriesQuery.isError || hasProductsError;
  const filterState = parseCatalogFilterState(searchParams);
  const facetSelections = parseCatalogFacetSelections(searchParams);
  const filterCounts = getCatalogFilterCounts(facetSelections, filterState);
  const mobileParams = mobileDraftParams ?? searchParams;
  const mobileFilterState = parseCatalogFilterState(mobileParams);
  const mobileFacetSelections = parseCatalogFacetSelections(mobileParams);
  const mobileAttributeFilters = parseCatalogAttributeFilters(mobileParams);
  const mobileProductFilters = createProductFilterParams(mobileFilterState);
  const mobilePreviewQuery = useProductsQuery(
    {
      filters: mobileAttributeFilters,
      limit: 1,
      page: 1,
      ...(mobileProductFilters.priceMin === undefined
        ? {}
        : { priceMin: mobileProductFilters.priceMin }),
      ...(mobileProductFilters.priceMax === undefined
        ? {}
        : { priceMax: mobileProductFilters.priceMax }),
      ...(mobileParams.get('search') === null ? {} : { search: mobileParams.get('search') ?? '' }),
    },
    { enabled: isMobileFiltersOpen && mobileDraftParams !== null },
  );

  function handleFiltersChange(changes: Partial<CatalogFilterState>): void {
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
    trackChange({
      filterCode: code,
      interaction: 'sidebar',
      selectedCount,
    });
  }

  function handleResetFilters(): void {
    const next = removeCatalogFilterParams(searchParams);
    next.delete('page');
    setSearchParams(next);
    catalogAnalytics.trackFiltersReset({
      interaction: 'sidebar',
      previousFilterGroupCount: filterCounts.groupCount,
      previousFilterValueCount: filterCounts.valueCount,
    });
  }

  function handleFacetChange(code: string, values: readonly string[]): void {
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
    trackChange({
      filterCode: code,
      interaction: 'sidebar',
      selectedCount: values.length,
    });
  }

  function updateMobileDraft(updater: (draft: URLSearchParams) => URLSearchParams): void {
    setMobileDraftParams((current) => updater(new URLSearchParams(current ?? searchParams)));
  }

  function handleMobileFiltersChange(changes: Partial<CatalogFilterState>): void {
    updateMobileDraft((draft) => {
      const next = applyCatalogFilterChanges(draft, changes);
      next.delete('page');
      return next;
    });
  }

  function handleMobileFacetChange(code: string, values: readonly string[]): void {
    updateMobileDraft((draft) => {
      const key = `filter[${code}]`;

      if (values.length === 0) {
        draft.delete(key);
      } else {
        draft.set(key, values.join(','));
      }
      draft.delete('page');
      return draft;
    });
  }

  function trackMobileDraftChanges(draft: URLSearchParams): void {
    const draftFilterState = parseCatalogFilterState(draft);
    const draftFacetSelections = parseCatalogFacetSelections(draft);
    const draftFilterCounts = getCatalogFilterCounts(draftFacetSelections, draftFilterState);
    const removedEveryFilter = filterCounts.groupCount > 0 && draftFilterCounts.groupCount === 0;

    if (removedEveryFilter) {
      catalogAnalytics.trackFiltersReset({
        interaction: 'mobile_drawer',
        previousFilterGroupCount: filterCounts.groupCount,
        previousFilterValueCount: filterCounts.valueCount,
      });
    } else {
      const facetCodes = new Set([
        ...Object.keys(facetSelections),
        ...Object.keys(draftFacetSelections),
      ]);

      for (const code of facetCodes) {
        const previousValues = facetSelections[code] ?? [];
        const nextValues = draftFacetSelections[code] ?? [];

        if (haveSameFacetValues(previousValues, nextValues)) {
          continue;
        }

        const trackChange =
          nextValues.length < previousValues.length
            ? catalogAnalytics.trackFilterRemoved
            : catalogAnalytics.trackFilterApplied;
        trackChange({
          filterCode: code,
          interaction: 'mobile_drawer',
          selectedCount: nextValues.length,
        });
      }

      const previousPriceCount = getStaticFilterSelectionCount(filterState, 'price');
      const nextPriceCount = getStaticFilterSelectionCount(draftFilterState, 'price');
      const priceChanged =
        filterState.priceMin !== draftFilterState.priceMin ||
        filterState.priceMax !== draftFilterState.priceMax;

      if (priceChanged) {
        const trackPriceChange =
          nextPriceCount < previousPriceCount
            ? catalogAnalytics.trackFilterRemoved
            : catalogAnalytics.trackFilterApplied;
        trackPriceChange({
          filterCode: 'price',
          interaction: 'mobile_drawer',
          selectedCount: nextPriceCount,
        });
      }
    }

    const previousSort = getSort(searchParams.get('sort'));
    const nextSort = getSort(draft.get('sort'));

    if (nextSort !== previousSort) {
      catalogAnalytics.trackSortChanged({ interaction: 'mobile_drawer', sort: nextSort });
    }
  }

  function closeMobileFilters(): void {
    setIsMobileFiltersOpen(false);
    setMobileDraftParams(null);
  }

  function renderSidebarBody({
    categoriesFirst,
    headingLevel,
    panelFacetSelections,
    panelFacets,
    panelFilterState,
    onFacetChange,
    onFiltersChange,
    onReset,
    sortControl,
  }: {
    categoriesFirst: boolean;
    headingLevel: 2 | 3;
    panelFacetSelections: ReturnType<typeof parseCatalogFacetSelections>;
    panelFacets: readonly ProductFacet[] | undefined;
    panelFilterState: CatalogFilterState;
    onFacetChange: (code: string, values: readonly string[]) => void;
    onFiltersChange: (changes: Partial<CatalogFilterState>) => void;
    onReset: () => void;
    sortControl?: ReactNode;
  }) {
    const SidebarHeading = headingLevel === 2 ? 'h2' : 'h3';
    const categorySection = (
      <section className={styles.sidebarSection}>
        <SidebarHeading className={styles.sidebarTitle}>Категории</SidebarHeading>
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
      </section>
    );
    const filterSection = (
      <div className={styles.sidebarSection}>
        <CatalogFilterPanel
          facetSelections={panelFacetSelections}
          {...(panelFacets === undefined ? {} : { facets: panelFacets })}
          headingLevel={headingLevel}
          onFacetChange={onFacetChange}
          onFiltersChange={onFiltersChange}
          onReset={onReset}
          showActiveFilters={false}
          state={panelFilterState}
        />
      </div>
    );

    return (
      <>
        {sortControl === undefined ? null : (
          <div className={styles.mobileSorting}>{sortControl}</div>
        )}
        <div className={styles.sidebarSections}>
          {categoriesFirst ? categorySection : filterSection}
          {categoriesFirst ? filterSection : categorySection}
        </div>
      </>
    );
  }

  return (
    <div className={styles.page}>
      <PageMetadata metadata={hasPageError ? catalogErrorMetadata : catalogMetadata} />
      <Container className={styles.content} size="wide">
        <h1 className={styles.heading}>Каталог товаров</h1>
        <div className={styles.layout}>
          <aside className={styles.sidebar}>
            <div className={styles.sidebarInner}>
              <div className={styles.sidebarBody}>
                {renderSidebarBody({
                  categoriesFirst: true,
                  headingLevel: 2,
                  onFacetChange: handleFacetChange,
                  onFiltersChange: handleFiltersChange,
                  onReset: handleResetFilters,
                  panelFacetSelections: facetSelections,
                  panelFacets: facets,
                  panelFilterState: filterState,
                })}
              </div>
            </div>
          </aside>
          <div className={styles.main}>
            <CatalogContent
              analyticsContext={{ categoryId: null, surface: 'catalog' }}
              emptyBrowseTarget={{
                action: 'go_home',
                label: 'Вернуться на главную',
                to: '/',
              }}
              {...(facets === undefined ? {} : { facets })}
              filterControl={
                <div className={styles.mobileFilterTrigger}>
                  <Button
                    aria-expanded={isMobileFiltersOpen}
                    aria-haspopup="dialog"
                    isFullWidth
                    onClick={() => {
                      setMobileDraftParams(new URLSearchParams(searchParams));
                      setIsMobileFiltersOpen(true);
                    }}
                    variant="secondary"
                  >
                    Фильтры и сортировка
                  </Button>
                </div>
              }
              onFacetsChange={setFacets}
              onQueryErrorChange={setHasProductsError}
              showSearch={false}
              sortingMode="desktop"
            />
          </div>
        </div>
        <Dialog
          closeLabel="Закрыть фильтры"
          description="Настройте сортировку и фильтры, затем примените изменения."
          footer={
            <div className={styles.mobileDrawerFooter}>
              <Button
                onClick={() => {
                  updateMobileDraft((draft) => {
                    const next = removeCatalogFilterParams(draft);
                    next.delete('page');
                    return next;
                  });
                }}
                variant="secondary"
              >
                Сбросить
              </Button>
              <Button
                isLoading={mobilePreviewQuery.isPending}
                onClick={() => {
                  if (mobileDraftParams !== null) {
                    trackMobileDraftChanges(mobileDraftParams);
                    setSearchParams(mobileDraftParams);
                  }
                  closeMobileFilters();
                }}
              >
                {formatShowProductsLabel(mobilePreviewQuery.data?.pagination.total)}
              </Button>
            </div>
          }
          mobileFullscreen
          onClose={closeMobileFilters}
          open={isMobileFiltersOpen}
          title="Фильтры и сортировка"
        >
          <div className={styles.mobileDrawerBody}>
            {renderSidebarBody({
              categoriesFirst: false,
              headingLevel: 3,
              onFacetChange: handleMobileFacetChange,
              onFiltersChange: handleMobileFiltersChange,
              onReset: () => {
                updateMobileDraft((draft) => {
                  const next = removeCatalogFilterParams(draft);
                  next.delete('page');
                  return next;
                });
              },
              panelFacetSelections: mobileFacetSelections,
              panelFacets: mobilePreviewQuery.data?.facets ?? facets,
              panelFilterState: mobileFilterState,
              sortControl: (
                <ProductSorting
                  onSortChange={(value) => {
                    updateMobileDraft((draft) => {
                      draft.set('sort', value);
                      draft.delete('page');
                      return draft;
                    });
                  }}
                  value={getSort(mobileParams.get('sort'))}
                />
              ),
            })}
          </div>
        </Dialog>
      </Container>
    </div>
  );
}
