import { Link } from 'react-router';

import { useCategoriesQuery } from '@/entities/category';
import { Skeleton } from '@/shared/ui';

import styles from './home-categories.module.css';

export function HomeCategories() {
  const query = useCategoriesQuery();

  if (query.isPending) {
    return (
      <section className={styles.section}>
        <div className={styles.container}>
          <Skeleton height="12rem" label="Загрузка категорий" variant="rectangle" />
        </div>
      </section>
    );
  }

  if (query.isError) {
    return (
      <section className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Категории</h2>
          <p className={styles.sectionText}>Не удалось загрузить категории.</p>
        </div>
      </section>
    );
  }

  const categories = query.data
    .filter((category) => category.parentId === null)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, 4);

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.sectionTitle}>Категории</h2>
        <div className={styles.categoriesGrid}>
          {categories.map((category) => (
            <Link className={styles.categoryCard} key={category.id} to={category.path}>
              <span className={styles.categoryName}>{category.name}</span>
              <svg
                aria-hidden="true"
                className={styles.categoryArrow}
                fill="none"
                height="20"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                width="20"
              >
                <path d="M5 12h14m-7-7 7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
