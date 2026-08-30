import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';

import { selectCartLineCount, useCartHydration, useCartStore } from '@/entities/cart';
import {
  selectFavoriteCount,
  useFavoritesHydration,
  useFavoritesStore,
} from '@/features/favorites';
import { getFocusableElements } from '@/shared/lib';
import {
  CartIcon,
  CloseIcon,
  Container,
  Grid2x2Icon,
  HeartIcon,
  IconButton,
  MenuIcon,
  PhoneIcon,
  TruckIcon,
  UserIcon,
  WrenchIcon,
} from '@/shared/ui';

import { HeaderSearch } from './HeaderSearch';
import styles from './header.module.css';

function BrandMark() {
  return (
    <Link aria-label="BELT — на главную" className={styles.brand} to="/">
      BELT
    </Link>
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
            <CloseIcon size={24} />
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
          {isMenuOpen ? <CloseIcon size={24} /> : <MenuIcon />}
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
            className={[styles.actionLink, styles.mobileRedundantAction].join(' ').trim()}
            title="Избранное"
            to="/favorites"
          >
            <HeartIcon />
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
              [
                styles.actionLink,
                styles.mobileRedundantAction,
                isActive ? styles.actionLinkActive : '',
              ]
                .join(' ')
                .trim()
            }
            title="Корзина"
            to="/cart"
          >
            <CartIcon />
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
