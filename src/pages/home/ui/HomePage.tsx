import { Link } from 'react-router';

import { CityChoicePopover } from '@/features/location-choice';
import { appConfig } from '@/shared/config';
import { createPageMetadata, PageMetadata, StructuredData } from '@/shared/lib';
import { Container } from '@/shared/ui';
import { HomeCategories } from '@/widgets/home-categories';
import { HomeFeaturedProducts } from '@/widgets/home-featured-products';

import styles from './home-page.module.css';

const TASK_LINKS = [
  {
    description: 'ПНД, ПВХ, полипропиленовые и металлические трубы.',
    label: 'Для трубопровода',
    to: '/catalog/truby',
  },
  {
    description: 'Муфты, угольники, тройники, переходники и заглушки.',
    label: 'Для соединения и монтажа',
    to: '/catalog/fitingi-i-soedineniya',
  },
  {
    description: 'Уплотнители, манжеты, прокладки, шланги и техническая резина.',
    label: 'Для герметизации и защиты',
    to: '/catalog/rezinotehnicheskie-izdeliya',
  },
] as const;

const homeMetadata = createPageMetadata(
  {
    canonicalPath: '/',
    description:
      'Каталог труб, фитингов, РТИ и промышленных комплектующих BELT. Склад в Тольятти, работаем с заказами по Самарской области.',
    title: 'Трубы, фитинги и РТИ в Тольятти',
    brandName: 'BELT',
  },
  appConfig.publicSiteUrl,
);

const homeStructuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@id': new URL('/#organization', appConfig.publicSiteUrl).toString(),
      '@type': 'Organization',
      name: 'BELT',
      url: new URL('/', appConfig.publicSiteUrl).toString(),
    },
    {
      '@id': new URL('/#website', appConfig.publicSiteUrl).toString(),
      '@type': 'WebSite',
      name: 'BELT',
      publisher: { '@id': new URL('/#organization', appConfig.publicSiteUrl).toString() },
      url: new URL('/', appConfig.publicSiteUrl).toString(),
    },
  ],
} as const;

function HeroSection() {
  return (
    <section aria-label="Главный баннер" className={styles.hero}>
      <picture aria-hidden="true" className={styles.heroMedia}>
        <source media="(max-width: 47.9375rem)" srcSet="/images/home/hero/hero-mobile.jpg" />
        <img
          alt=""
          decoding="async"
          fetchPriority="high"
          height="1024"
          src="/images/home/hero/hero-desktop.jpg"
          width="1536"
        />
      </picture>
      <Container className={styles.heroContainer} size="wide">
        <div className={styles.heroLayout}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>Трубы, фитинги и РТИ для ремонта и монтажа</h1>
            <p className={styles.heroText}>
              Найдите нужный материал и размер в каталоге BELT, сравните характеристики и добавьте
              подходящий вариант в корзину.
            </p>
            <div className={styles.heroActions}>
              <Link className={styles.heroCta} to="/catalog">
                Найти товар в каталоге
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function HomeServiceBar() {
  return (
    <div className={styles.serviceBar}>
      <Container size="wide">
        <nav aria-label="Предложения и регион работы" className={styles.serviceBarContent}>
          <Link className={[styles.serviceBarLink, styles.serviceBarPromo].join(' ')} to="/offers">
            <span className={styles.serviceBarLabelDesktop}>Акции и спецпредложения</span>
            <span className={styles.serviceBarLabelMobile}>Акции</span>
          </Link>
          <Link className={styles.serviceBarLink} to="/wholesale">
            <span className={styles.serviceBarLabelDesktop}>Оптовым покупателям</span>
            <span className={styles.serviceBarLabelMobile}>Оптовым покупателям</span>
          </Link>
          <CityChoicePopover
            buttonClassName={styles.serviceBarButton}
            className={styles.serviceBarCity}
          />
        </nav>
      </Container>
    </div>
  );
}

export function HomePage() {
  return (
    <div className={styles.page}>
      <PageMetadata metadata={homeMetadata} />
      <StructuredData data={homeStructuredData} />
      <HomeServiceBar />
      <HeroSection />
      <HomeCategories />
      <HomeFeaturedProducts />
      <section aria-labelledby="task-selection-title" className={styles.taskSelection}>
        <Container className={styles.taskSelectionContent} size="wide">
          <div className={styles.taskSelectionIntro}>
            <h2 id="task-selection-title">Подберите материалы под вашу задачу</h2>
            <p>
              Начните со сценария применения. В категориях можно сравнить характеристики, варианты
              товара и условия продажи.
            </p>
          </div>
          <div className={styles.taskList}>
            {TASK_LINKS.map((task) => (
              <Link className={styles.taskLink} key={task.to} to={task.to}>
                <span className={styles.taskCopy}>
                  <span className={styles.taskTitle}>{task.label}</span>
                  <span className={styles.taskDescription}>{task.description}</span>
                </span>
                <span aria-hidden="true" className={styles.taskArrow}>
                  →
                </span>
              </Link>
            ))}
          </div>
          <div className={styles.selectionCta}>
            <div>
              <h3>Не нашли нужные характеристики?</h3>
              <p>
                Поможем подобрать материал, размер и подходящий вариант под условия эксплуатации.
              </p>
            </div>
            <div className={styles.selectionActions}>
              <Link className={styles.selectionPrimary} to="/selection-help">
                Помощь с подбором
              </Link>
            </div>
          </div>
        </Container>
      </section>
      <section aria-labelledby="service-area-title" className={styles.serviceArea}>
        <Container className={styles.serviceAreaContent} size="wide">
          <div>
            <h2 id="service-area-title">Доставка из Тольятти по всей Самарской области</h2>
            <p>
              BELT комплектует заказы на трубы, фитинги, резинотехнические изделия и промышленные
              комплектующие. Условия получения и доставки зависят от состава заказа и адреса.
            </p>
          </div>
        </Container>
      </section>
    </div>
  );
}
