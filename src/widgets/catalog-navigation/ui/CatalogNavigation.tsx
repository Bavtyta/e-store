import { NavLink } from 'react-router';

import type { Category } from '@/entities/category';

import styles from './catalog-navigation.module.css';

export interface CatalogNavigationProps {
  categories: readonly Category[];
}

function CategoryBranch({
  categories,
  parentId,
}: {
  categories: readonly Category[];
  parentId: string | null;
}) {
  const items = categories
    .filter((category) => category.parentId === parentId)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  if (items.length === 0) {
    return null;
  }

  return (
    <ul>
      {items.map((category) => (
        <li key={category.id}>
          <NavLink
            className={({ isActive }) =>
              [styles.link, isActive ? styles.linkActive : ''].join(' ').trim()
            }
            to={category.path}
          >
            {category.name}
          </NavLink>
          <CategoryBranch categories={categories} parentId={category.id} />
        </li>
      ))}
    </ul>
  );
}

export function CatalogNavigation({ categories }: CatalogNavigationProps) {
  return (
    <nav aria-label="Категории каталога" className={styles.root}>
      <CategoryBranch categories={categories} parentId={null} />
    </nav>
  );
}
