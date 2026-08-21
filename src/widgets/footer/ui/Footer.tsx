import { Link } from 'react-router';

import { Container } from '@/shared/ui';

import styles from './footer.module.css';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.root}>
      <Container className={styles.content} size="wide">
        <div className={styles.grid}>
          {/* Brand */}
          <div className={styles.brandCol}>
            <div className={styles.brand}>BELT</div>
            <p className={styles.brandTagline}>
              Промышленные поставки строительных материалов и комплектующих для бизнеса.
            </p>
          </div>

          <div className={styles.col}>
            <h2 className={styles.heading}>Компания</h2>
            <Link className={styles.link} to="/about">
              О компании
            </Link>
            <Link className={styles.link} to="/contacts">
              Контакты и адреса
            </Link>
            <Link className={styles.link} to="/services">
              Услуги
            </Link>
            <Link className={styles.link} to="/delivery">
              Доставка
            </Link>
          </div>
          <div className={styles.col}>
            <h2 className={styles.heading}>Покупателям</h2>
            <Link className={styles.link} to="/catalog">
              Каталог
            </Link>
            <Link className={styles.link} to="/cart">
              Корзина
            </Link>
            <Link className={styles.link} to="/wholesale">
              Оптовые заказы
            </Link>
            <Link className={styles.link} to="/support">
              Служба поддержки
            </Link>
          </div>
          <div className={styles.col}>
            <h2 className={styles.heading}>Документы</h2>
            <Link className={styles.link} to="/privacy">
              Политика конфиденциальности
            </Link>
            <Link className={styles.link} to="/terms">
              Пользовательское соглашение
            </Link>
          </div>
        </div>
        <p className={styles.copyright}>© {currentYear} BELT. Все права защищены.</p>
      </Container>
    </footer>
  );
}
