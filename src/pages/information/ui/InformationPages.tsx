import { Link } from 'react-router';

import { appConfig } from '@/shared/config';
import { createPageMetadata, PageMetadata } from '@/shared/lib';
import { Container } from '@/shared/ui';

import styles from './information-pages.module.css';

interface InformationPageProps {
  canonicalPath: string;
  description: string;
  eyebrow: string;
  items: readonly { title: string; text: string }[];
  title: string;
}

function InformationPage({
  canonicalPath,
  description,
  eyebrow,
  items,
  title,
}: InformationPageProps) {
  const metadata = createPageMetadata(
    { canonicalPath, description, indexable: false, title },
    appConfig.publicSiteUrl,
  );

  return (
    <Container className={styles.page} size="wide">
      <PageMetadata metadata={metadata} />
      <header className={styles.header}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </header>
      <div className={styles.list}>
        {items.map((item) => (
          <section className={styles.item} key={item.title}>
            <h2>{item.title}</h2>
            <p>{item.text}</p>
          </section>
        ))}
      </div>
      <aside className={styles.cta}>
        <div>
          <h2>Нужна помощь с конкретной задачей?</h2>
          <p>Опишите материал, размер и условия применения в демонстрационной форме.</p>
        </div>
        <Link to="/selection-help">Запросить подбор</Link>
      </aside>
    </Container>
  );
}

export function AboutPage() {
  return (
    <InformationPage
      canonicalPath="/about"
      description="BELT помогает подобрать строительные и промышленные материалы для рабочих задач."
      eyebrow="О BELT"
      items={[
        {
          title: 'Практичный каталог',
          text: 'Товары организованы по категориям, характеристикам и вариантам исполнения.',
        },
        {
          title: 'Локальная работа',
          text: 'Доставка выполняется из Тольятти по Самарской области.',
        },
      ]}
      title="О компании"
    />
  );
}

export function ServicesPage() {
  return (
    <InformationPage
      canonicalPath="/services"
      description="Основные сценарии обслуживания, которые предусмотрены в MVP BELT."
      eyebrow="Услуги"
      items={[
        {
          title: 'Помощь в выборе',
          text: 'Поможем сформулировать требования к материалу, диаметру и условиям применения.',
        },
        {
          title: 'Доставка',
          text: 'Организуем доставку из Тольятти по Самарской области. Условия зависят от заказа и адреса.',
        },
        {
          title: 'Оптовые заказы',
          text: 'Условия оптового заказа уточняются индивидуально при обращении к менеджеру.',
        },
      ]}
      title="Услуги"
    />
  );
}

export function DeliveryPage() {
  return (
    <InformationPage
      canonicalPath="/delivery"
      description="Доставка заказов из Тольятти по всей Самарской области."
      eyebrow="Получение заказа"
      items={[
        { title: 'География', text: 'Работаем с заказами по Самарской области.' },
        {
          title: 'Расчёт условий',
          text: 'Стоимость и способ получения зависят от состава заказа и адреса. Точные условия сообщит менеджер.',
        },
      ]}
      title="Доставка"
    />
  );
}

export function WholesalePage() {
  return (
    <InformationPage
      canonicalPath="/wholesale"
      description="Оптовые условия BELT согласуются индивидуально по составу заказа."
      eyebrow="Для бизнеса"
      items={[
        {
          title: 'Индивидуальные условия',
          text: 'Оптовые условия рассчитываются по составу, количеству и особенностям заказа.',
        },
        {
          title: 'Подбор позиций',
          text: 'В обращении можно указать материал, размеры, количество и назначение.',
        },
      ]}
      title="Оптовые заказы"
    />
  );
}

export function SupportPage() {
  return (
    <InformationPage
      canonicalPath="/support"
      description="Помощь с каталогом, характеристиками, корзиной и подбором материалов."
      eyebrow="Поддержка"
      items={[
        {
          title: 'До заказа',
          text: 'Поможем найти нужное исполнение товара и проверить исходные требования.',
        },
        {
          title: 'Каналы связи',
          text: 'Телефон, электронная почта и мессенджеры будут опубликованы после подтверждения контактных данных.',
        },
      ]}
      title="Служба поддержки"
    />
  );
}

export function ContactsPage() {
  return (
    <InformationPage
      canonicalPath="/contacts"
      description="BELT работает в Тольятти и организует доставку по Самарской области."
      eyebrow="Связь с BELT"
      items={[
        {
          title: 'Тольятти',
          text: 'Склад находится в Тольятти. Условия и место получения согласуются вместе с заказом.',
        },
        {
          title: 'Связаться удобным способом',
          text: 'До публикации официальных контактов используйте форму помощи с подбором на сайте.',
        },
      ]}
      title="Контакты"
    />
  );
}
