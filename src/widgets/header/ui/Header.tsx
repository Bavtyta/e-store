import { Link, NavLink } from 'react-router';

import { selectCartLineCount, useCartHydration, useCartStore } from '@/entities/cart';
import { Container } from '@/shared/ui';

import styles from './header.module.css';

export function Header() {
  useCartHydration();
  const cartLineCount = useCartStore(selectCartLineCount);

  return (
    <header className={styles.root}>
      <a className={styles.skipLink} href="#main-content">
        Перейти к основному содержимому
      </a>
      <Container className={styles.content}>
        <Link className={styles.brand} to="/">
          ПромМатериалы
        </Link>
        <nav aria-label="Основная навигация">
          <NavLink to="/catalog">Каталог</NavLink>
          <NavLink to="/contacts">Контакты</NavLink>
          <NavLink className={styles.cartLink ?? ''} to="/cart">
            Корзина
            {cartLineCount === 0 ? null : (
              <span
                aria-label={`В корзине позиций: ${String(cartLineCount)}`}
                className={styles.cartCount}
              >
                {cartLineCount}
              </span>
            )}
          </NavLink>
        </nav>
      </Container>
    </header>
  );
}
