import { Link } from 'react-router';

import { Container } from '@/shared/ui';

import styles from './footer.module.css';

export function Footer() {
  return (
    <footer className={styles.root}>
      <Container className={styles.content}>
        <span>ПромМатериалы</span>
        <nav aria-label="Служебная навигация">
          <Link to="/privacy">Политика конфиденциальности</Link>
          <Link to="/terms">Пользовательское соглашение</Link>
        </nav>
      </Container>
    </footer>
  );
}
