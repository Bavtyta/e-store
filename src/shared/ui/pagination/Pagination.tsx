import { Link } from 'react-router';

import styles from './pagination.module.css';

export interface PaginationProps {
  currentPage: number;
  createPageHref: (page: number) => string;
  totalPages: number;
}

export function Pagination({ currentPage, createPageHref, totalPages }: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav aria-label="Пагинация" className={styles.root}>
      {currentPage > 1 ? <Link to={createPageHref(currentPage - 1)}>Назад</Link> : null}
      <ol>
        {pages.map((page) => (
          <li key={page}>
            <Link
              aria-current={page === currentPage ? 'page' : undefined}
              to={createPageHref(page)}
            >
              {page}
            </Link>
          </li>
        ))}
      </ol>
      {currentPage < totalPages ? <Link to={createPageHref(currentPage + 1)}>Вперёд</Link> : null}
    </nav>
  );
}
