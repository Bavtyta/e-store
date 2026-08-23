import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent } from 'react';
import { Link, useNavigate } from 'react-router';

import { useCategoriesQuery } from '@/entities/category';
import { formatProductPrice, useProductsQuery } from '@/entities/product';
import type { ProductListItem } from '@/entities/product';
import { useCatalogAnalytics } from '@/features/catalog-analytics';
import { interpretProductSearch } from '@/features/product-search';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CatalogIcon,
  CloseIcon,
  SearchIcon,
  SpinnerIcon,
} from '@/shared/ui';
import styles from './catalog-search-overlay.module.css';
import headerStyles from './header.module.css';

const SEARCH_DEBOUNCE_MS = 250;
const SEARCH_RESULT_LIMIT = 6;

interface SearchDestination {
  id: string;
  label: string;
  to: string;
}

export interface CatalogSearchOverlayProps {
  backdropTop: number;
  initialQuery: string;
  leftOffset: number;
  onClose: () => void;
  onOpen: () => void;
  open: boolean;
  topOffset: number;
}

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase('ru-RU');
}

function createProductFilters(
  facetSelections: Readonly<Record<string, readonly string[]>>,
): Readonly<Record<string, string>> {
  return Object.fromEntries(
    Object.entries(facetSelections)
      .filter(([, values]) => values.length > 0)
      .map(([code, values]) => [code, values.join(',')]),
  );
}

function formatAttribute(product: ProductListItem): string | null {
  const attribute = product.shortAttributes[0];

  if (attribute === undefined) return null;

  const value =
    typeof attribute.value === 'boolean'
      ? attribute.value
        ? 'Да'
        : 'Нет'
      : String(attribute.value);

  return `${attribute.name}: ${value}${attribute.unit === null ? '' : ` ${attribute.unit}`}`;
}

export function CatalogSearchOverlay({
  backdropTop,
  initialQuery,
  leftOffset,
  onClose,
  onOpen,
  open,
  topOffset,
}: CatalogSearchOverlayProps) {
  const navigate = useNavigate();
  const catalogAnalytics = useCatalogAnalytics({ categoryId: null, surface: 'catalog' });
  const inputRef = useRef<HTMLInputElement>(null);
  const skipNextFocusOpenRef = useRef(false);
  const listboxId = useId();
  const [draft, setDraft] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery.trim());
  const [activeIndex, setActiveIndex] = useState(-1);
  const normalizedDraft = normalize(draft);
  const hasQuery = normalizedDraft.length > 0;
  const categoriesQuery = useCategoriesQuery();
  const facetsQuery = useProductsQuery({ limit: 1 }, { enabled: open });
  const interpretedDebouncedSearch = useMemo(
    () => interpretProductSearch(debouncedQuery, facetsQuery.data?.facets),
    [debouncedQuery, facetsQuery.data?.facets],
  );
  const interpretedProductFilters = useMemo(
    () => createProductFilters(interpretedDebouncedSearch.facetSelections),
    [interpretedDebouncedSearch.facetSelections],
  );
  const productsQuery = useProductsQuery(
    {
      ...(Object.keys(interpretedProductFilters).length === 0
        ? {}
        : { filters: interpretedProductFilters }),
      limit: SEARCH_RESULT_LIMIT,
      ...(interpretedDebouncedSearch.query.length === 0
        ? {}
        : { search: interpretedDebouncedSearch.query }),
    },
    { enabled: debouncedQuery.length > 0 },
  );

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedQuery(draft.trim());
      setActiveIndex(-1);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [draft]);

  const matchingCategories = useMemo(() => {
    const categories = categoriesQuery.data ?? [];

    if (!hasQuery) return categories.filter((category) => category.parentId === null).slice(0, 6);

    return categories
      .filter((category) => normalize(category.name).includes(normalizedDraft))
      .slice(0, 4);
  }, [categoriesQuery.data, hasQuery, normalizedDraft]);

  const products = useMemo(
    () => (debouncedQuery === draft.trim() ? (productsQuery.data?.items ?? []) : []),
    [debouncedQuery, draft, productsQuery.data?.items],
  );
  const destinations = useMemo<SearchDestination[]>(
    () => [
      ...matchingCategories.map((category) => ({
        id: `category-${category.id}`,
        label: category.name,
        to: category.path,
      })),
      ...products.map((product) => ({
        id: `product-${product.id}`,
        label: product.name,
        to: `/product/${product.slug}`,
      })),
    ],
    [matchingCategories, products],
  );

  function openDestination(destination: SearchDestination): void {
    onClose();
    void navigate(destination.to);
  }

  function openAllResults(): void {
    const query = draft.trim();
    const interpretation = interpretProductSearch(
      query,
      facetsQuery.data?.facets ?? productsQuery.data?.facets,
    );
    const params = new URLSearchParams();

    if (interpretation.query.length > 0) {
      params.set('search', interpretation.query);
    }

    for (const [code, values] of Object.entries(interpretation.facetSelections)) {
      if (values.length > 0) {
        params.set(`filter[${code}]`, values.join(','));
      }
    }

    catalogAnalytics.trackSearchSubmitted({
      queryLength: query.length,
      recognizedFilterCount: Object.values(interpretation.facetSelections).reduce(
        (total, values) => total + values.length,
        0,
      ),
    });

    onClose();
    const serializedParams = params.toString();
    void navigate(serializedParams.length === 0 ? '/catalog' : `/catalog?${serializedParams}`);
  }

  const closeAndRestoreFocus = useCallback((): void => {
    onClose();

    if (document.activeElement === inputRef.current) return;

    skipNextFocusOpenRef.current = true;
    inputRef.current?.focus();
  }, [onClose]);

  function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      closeAndRestoreFocus();
      return;
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (destinations.length === 0) return;

      event.preventDefault();
      const direction = event.key === 'ArrowDown' ? 1 : -1;
      setActiveIndex((current) => {
        if (current < 0) return direction === 1 ? 0 : destinations.length - 1;
        return (current + direction + destinations.length) % destinations.length;
      });
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      const activeDestination = destinations[activeIndex];

      if (activeDestination === undefined) openAllResults();
      else openDestination(activeDestination);
    }
  }

  const isWaitingForDebounce = hasQuery && debouncedQuery !== draft.trim();
  const isLoading = hasQuery && (isWaitingForDebounce || productsQuery.isPending);
  const isError = hasQuery && productsQuery.isError;
  const hasResults = matchingCategories.length > 0 || products.length > 0;

  useEffect(() => {
    if (!open) return;

    function handleEscape(event: globalThis.KeyboardEvent): void {
      if (event.key !== 'Escape') return;
      closeAndRestoreFocus();
    }

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [closeAndRestoreFocus, open]);

  return (
    <>
      <form
        className={headerStyles.searchForm}
        onSubmit={(event) => {
          event.preventDefault();
          if (open) openAllResults();
          else onOpen();
        }}
        role="search"
      >
        <label className={headerStyles.visuallyHidden} htmlFor={`${listboxId}-input`}>
          Поиск по каталогу
        </label>
        <div
          className={[headerStyles.searchShell, open ? headerStyles.searchShellOpen : '']
            .join(' ')
            .trim()}
        >
          <span className={headerStyles.searchLeadingIcon}>
            {isLoading ? <SpinnerIcon className={headerStyles.searchSpinner} /> : <SearchIcon />}
          </span>
          <input
            autoComplete="off"
            aria-controls={open ? listboxId : undefined}
            aria-haspopup="dialog"
            className={headerStyles.searchInput}
            id={`${listboxId}-input`}
            onChange={(event) => {
              setDraft(event.target.value);
              setActiveIndex(-1);
              onOpen();
            }}
            onClick={() => {
              onOpen();
              inputRef.current?.focus();
            }}
            onFocus={() => {
              if (skipNextFocusOpenRef.current) {
                skipNextFocusOpenRef.current = false;
                return;
              }

              onOpen();
            }}
            onKeyDown={handleInputKeyDown}
            placeholder="Поиск по каталогу"
            ref={inputRef}
            type="search"
            value={draft}
          />
          {draft.length > 0 ? (
            <button
              aria-label="Очистить поиск"
              className={headerStyles.searchClear}
              onClick={() => {
                setDraft('');
                inputRef.current?.focus();
              }}
              type="button"
            >
              <CloseIcon />
            </button>
          ) : null}
          <button
            aria-controls={`${listboxId}-dialog`}
            aria-expanded={open}
            className={headerStyles.searchSubmit}
            type="submit"
          >
            Найти
          </button>
        </div>
      </form>
      {open ? (
        <>
          <button
            aria-label="Закрыть поиск"
            className={styles.backdrop}
            onClick={closeAndRestoreFocus}
            style={{ '--search-backdrop-top': `${String(backdropTop)}px` } as CSSProperties}
            type="button"
          />
          <div
            aria-label="Поиск по каталогу"
            className={styles.dropdown}
            id={`${listboxId}-dialog`}
            role="dialog"
            style={
              {
                '--search-dropdown-left': `${String(leftOffset)}px`,
                '--search-dropdown-top': `${String(topOffset)}px`,
              } as CSSProperties
            }
          >
            <div className={styles.mobileToolbar}>
              <button aria-label="Назад" onClick={closeAndRestoreFocus} type="button">
                <ArrowLeftIcon />
                <span>Назад</span>
              </button>
              <strong>Поиск по каталогу</strong>
            </div>
            <div className={styles.dropdownContent}>
              <p aria-live="polite" className={styles.visuallyHidden}>
                {activeIndex < 0 ? '' : `Выбрано: ${destinations[activeIndex]?.label ?? ''}`}
              </p>

              {!hasQuery ? (
                <div className={styles.initial}>
                  <section aria-labelledby={`${listboxId}-categories`}>
                    <div className={styles.sectionHeading}>
                      <h3 id={`${listboxId}-categories`}>Основные категории</h3>
                      <Link className={styles.catalogLink} onClick={onClose} to="/catalog">
                        <CatalogIcon />
                        <span>Перейти в каталог</span>
                      </Link>
                    </div>
                    {categoriesQuery.isPending ? <p role="status">Загружаем категории…</p> : null}
                    {categoriesQuery.isError ? (
                      <p role="alert">Не удалось загрузить категории.</p>
                    ) : null}
                    {matchingCategories.length > 0 ? (
                      <ul className={styles.categoryGrid}>
                        {matchingCategories.map((category) => (
                          <li key={category.id}>
                            <Link onClick={onClose} to={category.path}>
                              {category.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </section>
                </div>
              ) : (
                <div
                  aria-busy={isLoading}
                  className={[
                    styles.results,
                    !isLoading && !isError && matchingCategories.length > 0 && products.length > 0
                      ? styles.resultsSplit
                      : '',
                  ]
                    .join(' ')
                    .trim()}
                  id={listboxId}
                >
                  {isLoading ? (
                    <p className={styles.state} role="status">
                      Ищем товары…
                    </p>
                  ) : null}
                  {isError ? (
                    <div className={styles.state} role="alert">
                      <p>Не удалось выполнить поиск.</p>
                      <button onClick={() => void productsQuery.refetch()} type="button">
                        Повторить
                      </button>
                    </div>
                  ) : null}
                  {!isLoading && !isError && !hasResults ? (
                    <div className={styles.state} role="status">
                      <p>По запросу «{draft.trim()}» ничего не найдено.</p>
                      <Link onClick={onClose} to="/selection-help">
                        Помощь с подбором
                      </Link>
                    </div>
                  ) : null}

                  {!isLoading && !isError && matchingCategories.length > 0 ? (
                    <section
                      aria-labelledby={`${listboxId}-matching-categories`}
                      className={styles.categorySection}
                    >
                      <h3 id={`${listboxId}-matching-categories`}>Категории</h3>
                      <div className={styles.categoryMatches}>
                        {matchingCategories.map((category) => {
                          const index = destinations.findIndex(
                            (item) => item.id === `category-${category.id}`,
                          );
                          const destination = destinations[index];

                          if (destination === undefined) return null;

                          return (
                            <button
                              aria-current={activeIndex === index ? 'true' : undefined}
                              className={styles.categoryOption}
                              id={`category-${category.id}`}
                              key={category.id}
                              onClick={() => {
                                openDestination(destination);
                              }}
                              type="button"
                            >
                              {category.name}
                            </button>
                          );
                        })}
                      </div>
                    </section>
                  ) : null}

                  {!isLoading && !isError && products.length > 0 ? (
                    <section
                      aria-labelledby={`${listboxId}-products`}
                      className={styles.productSection}
                    >
                      <h3 id={`${listboxId}-products`}>Товары</h3>
                      <div className={styles.productList}>
                        {products.map((product) => {
                          const destinationId = `product-${product.id}`;
                          const index = destinations.findIndex((item) => item.id === destinationId);
                          const destination = destinations[index];
                          const attribute = formatAttribute(product);
                          const price = formatProductPrice(product.priceFrom, product.priceType);

                          if (destination === undefined) return null;

                          return (
                            <button
                              aria-current={activeIndex === index ? 'true' : undefined}
                              className={styles.productOption}
                              id={destinationId}
                              key={product.id}
                              onClick={() => {
                                openDestination(destination);
                              }}
                              type="button"
                            >
                              <span className={styles.productImage}>
                                {product.thumbnail === null ? null : (
                                  <img alt="" height={64} src={product.thumbnail.url} width={80} />
                                )}
                              </span>
                              <span className={styles.productCopy}>
                                <strong>{product.name}</strong>
                                {attribute === null ? null : <span>{attribute}</span>}
                              </span>
                              <span className={styles.price}>{price}</span>
                            </button>
                          );
                        })}
                      </div>
                    </section>
                  ) : null}

                  {!isLoading && !isError && hasResults ? (
                    <Link
                      className={styles.allResults}
                      onClick={onClose}
                      to={`/catalog?search=${encodeURIComponent(draft.trim())}`}
                    >
                      <span>Показать все результаты</span>
                      <ArrowRightIcon className={styles.allResultsArrow} />
                    </Link>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
