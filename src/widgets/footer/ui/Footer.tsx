import { Link } from 'react-router';

import { Container } from '@/shared/ui';

import styles from './footer.module.css';

export function Footer() {
  return (
    <footer className={styles.root}>
      <Container className={styles.content} size="wide">
        <div className={styles.grid}>
          {/* Brand */}
          <div className={styles.brandCol}>
            <div className={styles.brand}>BELT</div>
            <p className={styles.brandTagline}>
              © 2024 BELT Промышленные поставки. Все права защищены.
            </p>
          </div>

          {/* Nav columns */}
          <div className={styles.col}>
            <Link className={styles.link} to="/">
              О компании
            </Link>
            <Link className={styles.link} to="/terms">
              Пользовательское соглашение
            </Link>
          </div>
          <div className={styles.col}>
            <Link className={styles.link} to="/privacy">
              Политика конфиденциальности
            </Link>
            <Link className={styles.link} to="/contacts">
              Служба поддержки
            </Link>
          </div>
          <div className={styles.col}>
            <Link className={styles.link} to="/contacts">
              Оптовые заказы
            </Link>
            <Link className={styles.link} to="/contacts">
              Контакты и адреса
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
