import { Link } from 'react-router';

import { useCategoriesQuery } from '@/entities/category';
import { EmptyState, ErrorState, Skeleton } from '@/shared/ui';

import styles from './home-categories.module.css';

export function HomeCategories() {
  const query = useCategoriesQuery();

  if (query.isPending) {
    return <Skeleton height="12rem" label="Загрузка категорий" variant="rectangle" />;
  }

  if (query.isError) {
    return (
      <ErrorState
        description="Попробуйте загрузить категории ещё раз."
        onRetry={() => void query.refetch()}
        title="Не удалось загрузить категории"
      />
    );
  }

  const categories = query.data
    .filter((category) => category.parentId === null)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  if (categories.length === 0) {
    return (
      <EmptyState
        description="Основные разделы каталога появятся после обновления данных."
        title="Категории пока не добавлены"
      />
    );
  }

  return (
    <section aria-labelledby="home-categories-title" className={styles.root}>
      <div className={styles.heading}>
        <h2 id="home-categories-title">Основные категории</h2>
        <Link to="/catalog">Весь каталог</Link>
      </div>
      <ul>
        {categories.map((category) => (
          <li key={category.id}>
            <Link to={category.path}>{category.name}</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
