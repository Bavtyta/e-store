import { Link } from 'react-router';

import { useCategoriesQuery } from '@/entities/category';
import { ArrowRightIcon, Skeleton } from '@/shared/ui';

import styles from './home-categories.module.css';

const CATEGORY_DESCRIPTIONS: Readonly<Record<string, string>> = {
  kamery: 'Камеры и комплектующие',
  'fitingi-i-soedineniya': 'Муфты, угольники, тройники и переходники',
  'rezinotehnicheskie-izdeliya': 'Уплотнители, манжеты, прокладки и шланги',
  truby: 'ПНД, ПВХ, полипропиленовые и металлические',
};

const CATEGORY_IMAGES: Readonly<Record<string, string>> = {
  kamery: '/images/home/categories/kamery.jpg',
  'fitingi-i-soedineniya': '/images/home/categories/fitingi.jpg',
  'rezinotehnicheskie-izdeliya': '/images/home/categories/rti.jpg',
  truby: '/images/home/categories/truby.jpg',
};

export function HomeCategories() {
  const query = useCategoriesQuery();

  if (query.isPending) {
    return (
      <section aria-labelledby="home-categories-title" className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle} id="home-categories-title">
            Категории
          </h2>
          <div
            aria-busy="true"
            aria-label="Загрузка категорий"
            className={styles.categoriesGrid}
            role="status"
          >
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton
                height="13rem"
                isDecorative
                key={index}
                label="Загрузка категории"
                variant="rectangle"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (query.isError) {
    return (
      <section aria-labelledby="home-categories-title" className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle} id="home-categories-title">
            Категории
          </h2>
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
    <section aria-labelledby="home-categories-title" className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.sectionTitle} id="home-categories-title">
          Категории
        </h2>
        <div className={styles.categoriesGrid}>
          {categories.map((category) => (
            <Link className={styles.categoryCard} key={category.id} to={category.path}>
              <span aria-hidden="true" className={styles.categoryVisual}>
                {CATEGORY_IMAGES[category.slug] === undefined ? null : (
                  <img
                    alt=""
                    decoding="async"
                    height="640"
                    loading="lazy"
                    src={CATEGORY_IMAGES[category.slug]}
                    width="960"
                  />
                )}
              </span>
              <span className={styles.categoryContent}>
                <span className={styles.categoryName}>{category.name}</span>
                <span className={styles.categoryDescription}>
                  {CATEGORY_DESCRIPTIONS[category.slug] ?? 'Перейти к товарам категории'}
                </span>
              </span>
              <span aria-hidden="true" className={styles.categoryArrow}>
                <ArrowRightIcon size={20} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
