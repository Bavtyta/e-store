import { appConfig } from '@/shared/config';
import { createPageMetadata, PageMetadata } from '@/shared/lib';
import { Container } from '@/shared/ui';
import { Footer } from '@/widgets/footer';
import { Header } from '@/widgets/header';
import { HomeCategories } from '@/widgets/home-categories';

import styles from './home-page.module.css';

const homeMetadata = createPageMetadata(
  {
    canonicalPath: '/',
    description:
      'Каталог строительных и промышленных материалов: трубы, соединения, резинотехнические изделия и сопутствующие товары.',
    title: 'Строительные и промышленные материалы',
  },
  appConfig.publicSiteUrl,
);

export function HomePage() {
  return (
    <div className={styles.page}>
      <PageMetadata metadata={homeMetadata} />
      <Header />
      <main id="main-content" tabIndex={-1}>
        <section className={styles.hero}>
          <Container>
            <p className={styles.eyebrow}>Строительные и промышленные материалы</p>
            <h1>Материалы для монтажа, ремонта и производства</h1>
            <p>Каталог труб, соединений, резинотехнических изделий и сопутствующих товаров.</p>
          </Container>
        </section>
        <Container className={styles.content}>
          <HomeCategories />
          <section aria-labelledby="benefits-title" className={styles.benefits}>
            <h2 id="benefits-title">Каталог, в котором важны характеристики</h2>
            <ul>
              <li>Выбирайте материалы по назначению и параметрам.</li>
              <li>Сравнивайте доступные варианты и единицы измерения.</li>
              <li>Уточняйте наличие и актуальную цену перед оформлением заказа.</li>
            </ul>
          </section>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
