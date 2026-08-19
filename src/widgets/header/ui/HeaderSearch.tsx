import { useId, useState } from 'react';
import type { SubmitEvent } from 'react';
import { useLocation, useSearchParams } from 'react-router';

import { CatalogSearchOverlay } from './CatalogSearchOverlay';
import styles from './header.module.css';

function isCatalogPath(pathname: string): boolean {
  return pathname === '/catalog' || pathname.startsWith('/catalog/');
}

export function HeaderSearch() {
  const inputId = useId();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const activeQuery = isCatalogPath(location.pathname) ? (searchParams.get('search') ?? '') : '';

  function openSearch(): void {
    setIsOpen(true);
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>): void {
    event.preventDefault();
    openSearch();
  }

  return (
    <>
      <form className={styles.searchForm} onSubmit={handleSubmit} role="search">
        <label className={styles.visuallyHidden} htmlFor={inputId}>
          Поиск по каталогу
        </label>
        <input
          aria-haspopup="dialog"
          className={styles.searchInput}
          id={inputId}
          onClick={openSearch}
          placeholder="Поиск по каталогу"
          readOnly
          type="search"
          value={activeQuery}
        />
        <button
          aria-label="Открыть поиск по каталогу"
          className={styles.searchButton}
          type="submit"
        >
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
      {isOpen ? (
        <CatalogSearchOverlay
          initialQuery={activeQuery}
          onClose={() => {
            setIsOpen(false);
          }}
          open
        />
      ) : null}
    </>
  );
}
