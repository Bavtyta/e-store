import { useId, useRef, useState } from 'react';
import type { KeyboardEvent, SubmitEvent } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router';

import styles from './header.module.css';

function isCatalogPath(pathname: string): boolean {
  return pathname === '/catalog' || pathname.startsWith('/catalog/');
}

function createCatalogHref(pathname: string, searchParams: URLSearchParams): string {
  const queryString = searchParams.toString();

  return queryString.length === 0 ? pathname : `${pathname}?${queryString}`;
}

export function HeaderSearch() {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const activeQuery = isCatalogPath(location.pathname) ? (searchParams.get('search') ?? '') : '';
  const [draft, setDraft] = useState(activeQuery);
  const [previousQuery, setPreviousQuery] = useState(activeQuery);

  if (previousQuery !== activeQuery) {
    setPreviousQuery(activeQuery);
    setDraft(activeQuery);
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextQuery = draft.trim();

    if (nextQuery.length === 0) {
      return;
    }

    void navigate(`/catalog?search=${encodeURIComponent(nextQuery)}`);
  }

  function clearSearch() {
    setDraft('');
    inputRef.current?.focus();

    if (!isCatalogPath(location.pathname) || searchParams.get('search') === null) {
      return;
    }

    const next = new URLSearchParams(searchParams);

    next.delete('search');
    next.delete('page');
    void navigate(createCatalogHref(location.pathname, next));
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape' && draft.length > 0) {
      event.preventDefault();
      clearSearch();
    }
  }

  return (
    <form className={styles.searchForm} onSubmit={handleSubmit} role="search">
      <label className={styles.visuallyHidden} htmlFor={inputId}>
        Поиск по каталогу
      </label>
      <input
        className={styles.searchInput}
        id={inputId}
        onChange={(event) => {
          setDraft(event.target.value);
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
          className={styles.searchClear}
          onClick={clearSearch}
          type="button"
        >
          <span aria-hidden="true">×</span>
        </button>
      ) : null}
      <button aria-label="Найти" className={styles.searchButton} type="submit">
        <svg
          aria-hidden="true"
          fill="none"
          height="18"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width="18"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>
      </button>
    </form>
  );
}
