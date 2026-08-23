import { Link } from 'react-router';

import { useCategoriesQuery } from '@/entities/category';
import type { Category } from '@/entities/category';
import { Breadcrumbs, ErrorState, Skeleton } from '@/shared/ui';
import { CatalogContent } from './CatalogContent';

import styles from './category-catalog-content.module.css';

export interface CategoryCatalogContentProps {
  category: Category;
  categoryPath: string;
  onProductsErrorChange?: (hasError: boolean) => void;
}

function createCategoryChain(category: Category, categories: readonly Category[]): Category[] {
  const chain: Category[] = [];
  let current: Category | undefined = category;

  while (current !== undefined) {
    chain.unshift(current);
    const parentId: string | null = current.parentId;
    current =
      parentId === null ? undefined : categories.find((candidate) => candidate.id === parentId);
  }

  return chain;
}

export function CategoryCatalogContent({
  category,
  categoryPath,
  onProductsErrorChange,
}: CategoryCatalogContentProps) {
  const categoriesQuery = useCategoriesQuery();
  const categories = categoriesQuery.data ?? [];
  const children = categories
    .filter((item) => item.parentId === category.id)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const chain = createCategoryChain(category, categories);
  const parentCategory = chain.at(-2);

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Каталог', to: '/catalog' },
          ...chain.map((item, index) =>
            index === chain.length - 1 ? { label: item.name } : { label: item.name, to: item.path },
          ),
        ]}
      />
      <header className={styles.header}>
        <h1>{category.name}</h1>
        {category.description === null ? null : <p>{category.description}</p>}
        {parentCategory === undefined ? null : (
          <Link className={styles.parentCategoryLink} to={parentCategory.path}>
            Смотреть все товары категории «{parentCategory.name}»
          </Link>
        )}
      </header>
      {categoriesQuery.isPending ? (
        <Skeleton height="5rem" label="Загрузка структуры категории" variant="rectangle" />
      ) : null}
      {categoriesQuery.isError ? (
        <ErrorState
          description="Товары доступны, но структуру подкатегорий загрузить не удалось."
          onRetry={() => {
            void categoriesQuery.refetch();
          }}
          retryLabel="Повторить загрузку подкатегорий"
          title="Не удалось загрузить подкатегории"
          variant="inline"
        />
      ) : null}
      {children.length > 0 ? (
        <section aria-labelledby="children-title" className={styles.children}>
          <h2 id="children-title">Подкатегории</h2>
          <ul>
            {children.map((item) => (
              <li key={item.id}>
                <Link to={item.path}>{item.name}</Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <CatalogContent
        analyticsContext={{ categoryId: category.id, surface: 'category' }}
        categoryPath={categoryPath}
        emptyBrowseTarget={
          parentCategory === undefined
            ? {
                action: 'view_all_catalog',
                label: 'Смотреть весь каталог',
                to: '/catalog',
              }
            : {
                action: 'view_parent_category',
                label: `Смотреть товары категории «${parentCategory.name}»`,
                to: parentCategory.path,
              }
        }
        {...(onProductsErrorChange === undefined
          ? {}
          : { onQueryErrorChange: onProductsErrorChange })}
      />
    </>
  );
}
