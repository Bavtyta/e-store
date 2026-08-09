import { Link } from 'react-router';

import { appConfig } from '@/shared/config';
import { createPageMetadata, PageMetadata } from '@/shared/lib';
import { Container } from '@/shared/ui';
import { HomeCategories } from '@/widgets/home-categories';

import styles from './home-page.module.css';

const homeMetadata = createPageMetadata(
  {
    canonicalPath: '/',
    description:
      'Строительные материалы для профессионалов. Надежные поставки промышленных комплектующих.',
    title: 'BELT | Строительные материалы для профессионалов',
  },
  appConfig.publicSiteUrl,
);

function HeroSection() {
  return (
    <section aria-label="Главный баннер" className={styles.hero}>
      <Container size="wide">
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Строительные материалы для профессионалов</h1>
          <p className={styles.heroText}>
            Надежные поставки промышленных комплектующих. Прямые контракты с производителями,
            прозрачная логистика и оптовые цены для вашего бизнеса.
          </p>
          <Link className={styles.heroCta} to="/catalog">
            Перейти в каталог
          </Link>
        </div>
      </Container>
    </section>
  );
}

export function HomePage() {
  return (
    <div className={styles.page}>
      <PageMetadata metadata={homeMetadata} />
      <HeroSection />
      <HomeCategories />
    </div>
  );
}
