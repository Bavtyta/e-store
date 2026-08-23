import { useState } from 'react';
import { NavLink, useLocation } from 'react-router';

import type { Category } from '@/entities/category';

import styles from './catalog-navigation.module.css';

export interface CatalogNavigationProps {
  categories: readonly Category[];
}

function CategoryBranch({
  categories,
  currentPath,
  parentId,
}: {
  categories: readonly Category[];
  currentPath: string;
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
        <CategoryItem
          categories={categories}
          category={category}
          currentPath={currentPath}
          key={`${category.id}-${currentPath}`}
        />
      ))}
    </ul>
  );
}

function CategoryItem({
  categories,
  category,
  currentPath,
}: {
  categories: readonly Category[];
  category: Category;
  currentPath: string;
}) {
  const hasChildren = categories.some((item) => item.parentId === category.id);
  const isBranchActive =
    currentPath === category.path || currentPath.startsWith(`${category.path}/`);
  const [isExpanded, setIsExpanded] = useState(isBranchActive);

  return (
    <li className={styles.item}>
      <div className={styles.itemRow}>
        <NavLink
          className={({ isActive }) =>
            [styles.link, isActive ? styles.linkActive : ''].join(' ').trim()
          }
          to={category.path}
        >
          {category.name}
        </NavLink>
        {hasChildren ? (
          <button
            aria-expanded={isExpanded}
            aria-label={`${isExpanded ? 'Свернуть' : 'Развернуть'} категорию «${category.name}»`}
            className={styles.toggle}
            onClick={() => {
              setIsExpanded((current) => !current);
            }}
            type="button"
          >
            <span aria-hidden="true">{isExpanded ? '−' : '+'}</span>
          </button>
        ) : null}
      </div>
      {hasChildren && isExpanded ? (
        <CategoryBranch categories={categories} currentPath={currentPath} parentId={category.id} />
      ) : null}
    </li>
  );
}

export function CatalogNavigation({ categories }: CatalogNavigationProps) {
  const { pathname } = useLocation();

  return (
    <nav aria-label="Категории каталога" className={styles.root}>
      <CategoryBranch categories={categories} currentPath={pathname} parentId={null} />
    </nav>
  );
}
