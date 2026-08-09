import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';

import { selectCartLineCount, useCartHydration, useCartStore } from '@/entities/cart';
import { Container, IconButton } from '@/shared/ui';

import styles from './header.module.css';

function BrandMark() {
  return (
    <Link aria-label="BELT — на главную" className={styles.brand} to="/">
      BELT
    </Link>
  );
}

function BurgerIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="24"
      stroke="currentColor"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      width="24"
    >
      {isOpen ? (
        <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
      )}
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="22"
      stroke="currentColor"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      width="22"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" />
    </svg>
  );
}

function CartGlyph() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="22"
      stroke="currentColor"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      width="22"
    >
      <path d="M6 6h15l-1.5 9h-12L5 3H2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="18" cy="20" r="1.5" />
    </svg>
  );
}

const NAV_ITEMS = [
  { label: 'Каталог', to: '/catalog' },
  { label: 'Контакты', to: '/contacts' },
] as const;

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const closeReference = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeReference.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  function handleBackdropClick(event: React.MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) onClose();
  }

  if (!isOpen) return null;

  return (
    <div
      aria-modal="true"
      className={styles.drawerBackdrop}
      onClick={handleBackdropClick}
      role="dialog"
    >
      <div className={styles.drawer}>
        <div className={styles.drawerHeader}>
          <span className={styles.drawerTitle}>BELT</span>
          <button
            aria-label="Закрыть меню"
            className={styles.drawerClose}
            onClick={onClose}
            ref={closeReference}
            type="button"
          >
            <BurgerIcon isOpen />
          </button>
        </div>
        <nav aria-label="Мобильное меню" className={styles.drawerNav}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              className={({ isActive }) =>
                [styles.drawerLink, isActive ? styles.drawerLinkActive : ''].join(' ').trim()
              }
              key={item.to}
              onClick={onClose}
              to={item.to}
            >
              {item.label}
            </NavLink>
          ))}

          <NavLink
            className={({ isActive }) =>
              [styles.drawerLink, isActive ? styles.drawerLinkActive : ''].join(' ').trim()
            }
            onClick={onClose}
            to="/cart"
          >
            Корзина
          </NavLink>
        </nav>
      </div>
    </div>
  );
}

export function Header() {
  useCartHydration();
  const cartLineCount = useCartStore(selectCartLineCount);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const cartCountText = cartLineCount > 99 ? '99+' : String(cartLineCount);
  const cartLabel =
    cartLineCount > 0 ? `В корзине позиций: ${String(cartLineCount)}` : 'Корзина';

  return (
    <header className={styles.root}>
      <a className={styles.skipLink} href="#main-content">
        Перейти к основному содержимому
      </a>
      <Container className={styles.content} size="wide">
        <IconButton
          aria-expanded={isMenuOpen}
          className={styles.burger}
          label={isMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
          onClick={() => {
            setIsMenuOpen((previous) => !previous);
          }}
          variant="ghost"
        >
          <BurgerIcon isOpen={isMenuOpen} />
        </IconButton>

        <BrandMark />

        <nav aria-label="Основная навигация" className={styles.nav}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              className={({ isActive }) =>
                [styles.navLink, isActive ? styles.navLinkActive : ''].join(' ').trim()
              }
              key={item.to}
              to={item.to}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.actions}>
          <span className={styles.accountStub} title="Личный кабинет появится в следующем релизе">
            <UserIcon />
          </span>
          <NavLink
            aria-label={cartLabel}
            className={({ isActive }) =>
              [styles.actionLink, isActive ? styles.actionLinkActive : ''].join(' ').trim()
            }
            title="Корзина"
            to="/cart"
          >
            <CartGlyph />
            {cartLineCount > 0 ? <span className={styles.cartBadge}>{cartCountText}</span> : null}
          </NavLink>
        </div>
      </Container>
      <MobileMenu isOpen={isMenuOpen} key={location.key} onClose={closeMenu} />
    </header>
  );
}
