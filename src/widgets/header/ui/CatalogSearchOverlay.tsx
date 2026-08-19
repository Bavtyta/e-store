import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Link, useNavigate } from 'react-router';

import { useCategoriesQuery } from '@/entities/category';
import { formatProductPrice, useProductsQuery } from '@/entities/product';
import type { ProductListItem } from '@/entities/product';
import { Dialog } from '@/shared/ui';

import styles from './catalog-search-overlay.module.css';

const SEARCH_DEBOUNCE_MS = 250;
const SEARCH_RESULT_LIMIT = 6;

interface SearchDestination {
  id: string;
  label: string;
  to: string;
}

export interface CatalogSearchOverlayProps {
  initialQuery: string;
  onClose: () => void;
  open: boolean;
}

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase('ru-RU');
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

export function CatalogSearchOverlay({ initialQuery, onClose, open }: CatalogSearchOverlayProps) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();
  const [draft, setDraft] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery.trim());
  const [activeIndex, setActiveIndex] = useState(-1);
  const normalizedDraft = normalize(draft);
  const hasQuery = normalizedDraft.length > 0;
  const categoriesQuery = useCategoriesQuery();
  const productsQuery = useProductsQuery(
    { limit: SEARCH_RESULT_LIMIT, search: debouncedQuery },
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

    if (query.length === 0) {
      onClose();
      void navigate('/catalog');
      return;
    }

    onClose();
    void navigate(`/catalog?search=${encodeURIComponent(query)}`);
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
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

  return (
    <Dialog
      closeLabel="Закрыть поиск"
      initialFocusRef={inputRef}
      mobileFullscreen
      onClose={onClose}
      open={open}
      placement="top"
      size="wide"
      title="Поиск по каталогу"
    >
      <form
        className={styles.form}
        onSubmit={(event) => {
          event.preventDefault();
          openAllResults();
        }}
        role="search"
      >
        <label className={styles.label} htmlFor={`${listboxId}-input`}>
          Товар, категория или характеристика
        </label>
        <div className={styles.inputRow}>
          <input
            autoComplete="off"
            className={styles.input}
            id={`${listboxId}-input`}
            onChange={(event) => {
              setDraft(event.target.value);
              setActiveIndex(-1);
            }}
            onKeyDown={handleInputKeyDown}
            placeholder="Например, труба ПНД 32 мм"
            ref={inputRef}
            type="search"
            value={draft}
          />
          {draft.length > 0 ? (
            <button
              aria-label="Очистить поиск"
              className={styles.clear}
              onClick={() => {
                setDraft('');
                inputRef.current?.focus();
              }}
              type="button"
            >
              ×
            </button>
          ) : null}
          <button className={styles.submit} type="submit">
            Найти
          </button>
        </div>
      </form>
      <p aria-live="polite" className={styles.visuallyHidden}>
        {activeIndex < 0 ? '' : `Выбрано: ${destinations[activeIndex]?.label ?? ''}`}
      </p>

      {!hasQuery ? (
        <div className={styles.initial}>
          <section aria-labelledby={`${listboxId}-categories`}>
            <div className={styles.sectionHeading}>
              <h3 id={`${listboxId}-categories`}>Основные категории</h3>
              <Link onClick={onClose} to="/catalog">
                Весь каталог
              </Link>
            </div>
            {categoriesQuery.isPending ? <p role="status">Загружаем категории…</p> : null}
            {categoriesQuery.isError ? <p role="alert">Не удалось загрузить категории.</p> : null}
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
        <div aria-busy={isLoading} className={styles.results} id={listboxId}>
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
            <section aria-labelledby={`${listboxId}-matching-categories`}>
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
            <section aria-labelledby={`${listboxId}-products`}>
              <h3 id={`${listboxId}-products`}>Товары</h3>
              <div className={styles.productList}>
                {products.map((product) => {
                  const destinationId = `product-${product.id}`;
                  const index = destinations.findIndex((item) => item.id === destinationId);
                  const destination = destinations[index];
                  const attribute = formatAttribute(product);
                  const price = formatProductPrice(
                    product.priceFrom,
                    product.priceFrom === null
                      ? 'on_request'
                      : product.priceTo === null
                        ? 'fixed'
                        : 'from',
                  );

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
            <button className={styles.allResults} onClick={openAllResults} type="button">
              Показать все результаты
            </button>
          ) : null}
        </div>
      )}
    </Dialog>
  );
}
