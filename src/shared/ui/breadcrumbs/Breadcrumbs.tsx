import { Link } from 'react-router';

import styles from './breadcrumbs.module.css';

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

export interface BreadcrumbsProps {
  items: readonly BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Хлебные крошки" className={styles.root}>
      <ol>
        {items.map((item, index) => (
          <li key={`${item.label}-${String(index)}`}>
            {item.to === undefined ? (
              <span aria-current="page">{item.label}</span>
            ) : (
              <Link to={item.to}>{item.label}</Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
