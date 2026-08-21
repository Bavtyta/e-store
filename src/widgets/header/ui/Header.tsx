import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';

import { selectCartLineCount, useCartHydration, useCartStore } from '@/entities/cart';
import {
  selectFavoriteCount,
  useFavoritesHydration,
  useFavoritesStore,
} from '@/features/favorites';
import { getFocusableElements } from '@/shared/lib';
import { Container, Grid2x2Icon, IconButton, PhoneIcon, TruckIcon, WrenchIcon } from '@/shared/ui';

import { HeaderSearch } from './HeaderSearch';
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
  { icon: Grid2x2Icon, label: 'Каталог', to: '/catalog' },
  { icon: WrenchIcon, label: 'Услуги', to: '/services' },
  { icon: TruckIcon, label: 'Доставка', to: '/delivery' },
  { icon: PhoneIcon, label: 'Контакты', to: '/contacts' },
] as const;

interface MobileMenuProps {
  drawerId: string;
  isOpen: boolean;
  onClose: () => void;
  titleId: string;
}

function MobileMenu({ drawerId, isOpen, onClose, titleId }: MobileMenuProps) {
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const closeReference = useRef<HTMLButtonElement | null>(null);
  const openerReference = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const drawer = drawerRef.current;
    const activeElement = document.activeElement;
    openerReference.current = activeElement instanceof HTMLElement ? activeElement : null;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeReference.current?.focus();

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key !== 'Tab' || drawer === null) return;

      const focusableElements = getFocusableElements(drawer);
      const firstElement = focusableElements[0];
      const lastElement = focusableElements.at(-1);

      if (firstElement === undefined || lastElement === undefined) {
        event.preventDefault();
        drawer.focus();
        return;
      }

      const activeFocusable = document.activeElement;

      if (event.shiftKey && (activeFocusable === firstElement || activeFocusable === drawer)) {
        event.preventDefault();
        lastElement.focus();
        return;
      }

      if (!event.shiftKey && activeFocusable === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      openerReference.current?.focus();
      openerReference.current = null;
    };
  }, [isOpen, onClose]);

  function handleBackdropClick(event: React.MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) onClose();
  }

  if (!isOpen) return null;

  return (
    <div
      aria-labelledby={titleId}
      aria-modal="true"
      className={styles.drawerBackdrop}
      id={drawerId}
      onClick={handleBackdropClick}
      role="dialog"
    >
      <div className={styles.drawer} ref={drawerRef} tabIndex={-1}>
        <div className={styles.drawerHeader}>
          <span className={styles.drawerTitle} id={titleId}>
            BELT
          </span>
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
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}

          <NavLink
            className={({ isActive }) =>
              [styles.drawerLink, isActive ? styles.drawerLinkActive : ''].join(' ').trim()
            }
            onClick={onClose}
            to="/favorites"
          >
            Избранное
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              [styles.drawerLink, isActive ? styles.drawerLinkActive : ''].join(' ').trim()
            }
            onClick={onClose}
            to="/login"
          >
            Профиль
          </NavLink>
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
  useFavoritesHydration();
  const cartLineCount = useCartStore(selectCartLineCount);
  const favoriteCount = useFavoritesStore(selectFavoriteCount);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const drawerId = useId();
  const drawerTitleId = useId();

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const cartCountText = cartLineCount > 99 ? '99+' : String(cartLineCount);
  const cartLabel = cartLineCount > 0 ? `В корзине позиций: ${String(cartLineCount)}` : 'Корзина';

  return (
    <header className={styles.root}>
      <a className={styles.skipLink} href="#main-content">
        Перейти к основному содержимому
      </a>
      <Container className={styles.content} size="wide">
        <IconButton
          aria-controls={drawerId}
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
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className={styles.search}>
          <HeaderSearch />
        </div>

        <div className={styles.actions}>
          <NavLink
            aria-label="Избранное"
            className={styles.actionLink ?? ''}
            title="Избранное"
            to="/favorites"
          >
            <span aria-hidden="true" className={styles.favoriteGlyph}>
              ♡
            </span>
            {favoriteCount > 0 ? (
              <span className={styles.cartBadge}>{favoriteCount > 99 ? '99+' : favoriteCount}</span>
            ) : null}
          </NavLink>
          <NavLink
            aria-label="Профиль"
            className={styles.actionLink ?? ''}
            title="Профиль"
            to="/login"
          >
            <UserIcon />
          </NavLink>
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
      <MobileMenu
        drawerId={drawerId}
        isOpen={isMenuOpen}
        key={location.key}
        onClose={closeMenu}
        titleId={drawerTitleId}
      />
    </header>
  );
}
