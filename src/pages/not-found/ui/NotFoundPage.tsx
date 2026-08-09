import { Link } from 'react-router';

import { appConfig } from '@/shared/config';
import { createPageMetadata, PageMetadata } from '@/shared/lib';

import styles from './not-found-page.module.css';

const notFoundMetadata = createPageMetadata(
  {
    canonicalPath: '/404',
    description: 'Запрошенная страница не найдена.',
    indexable: false,
    title: 'Страница не найдена',
  },
  appConfig.publicSiteUrl,
);

export function NotFoundPage() {
  return (
    <>
      <PageMetadata metadata={notFoundMetadata} />
      <section className={styles.root}>
        <p className={styles.status}>404</p>
        <h1>Страница не найдена</h1>
        <p>Проверьте адрес или вернитесь на главную страницу.</p>
        <Link to="/">Вернуться на главную</Link>
      </section>
    </>
  );
}
