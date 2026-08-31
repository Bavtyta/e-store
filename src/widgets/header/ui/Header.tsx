import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';

import { selectCartLineCount, useCartHydration, useCartStore } from '@/entities/cart';
import { useCategoriesQuery } from '@/entities/category';
import type { Category } from '@/entities/category';
import {
  selectFavoriteCount,
  useFavoritesHydration,
  useFavoritesStore,
} from '@/features/favorites';
import { getFocusableElements } from '@/shared/lib';
import {
  ArrowRightIcon,
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

import { DesktopCatalogMenu, MobileCatalogMenu } from './CatalogMenu';
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
  { icon: WrenchIcon, label: 'Услуги', to: '/services' },
  { icon: TruckIcon, label: 'Доставка', to: '/delivery' },
  { icon: PhoneIcon, label: 'Контакты', to: '/contacts' },
] as const;

interface MobileMenuProps {
  categories: readonly Category[];
  categoriesError: boolean;
  categoriesPending: boolean;
  drawerId: string;
  isOpen: boolean;
  onClose: () => void;
  titleId: string;
}

function MobileMenu({
  categories,
  categoriesError,
  categoriesPending,
  drawerId,
  isOpen,
  onClose,
  titleId,
}: MobileMenuProps) {
  const [view, setView] = useState<'catalog' | 'main'>('main');
  const mobileCatalogId = useId();
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const closeReference = useRef<HTMLButtonElement | null>(null);
  const catalogBackReference = useRef<HTMLButtonElement | null>(null);
  const catalogTriggerReference = useRef<HTMLButtonElement | null>(null);
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
        if (view === 'catalog') {
          event.preventDefault();
          setView('main');
          window.setTimeout(() => {
            catalogTriggerReference.current?.focus();
          }, 0);
          return;
        }

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
  }, [isOpen, onClose, view]);

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
        {view === 'main' ? (
          <nav aria-label="Мобильное меню" className={styles.drawerNav}>
            <button
              aria-controls={mobileCatalogId}
              aria-expanded="false"
              className={[styles.drawerLink, styles.drawerCatalogTrigger].join(' ')}
              onClick={() => {
                setView('catalog');
                window.setTimeout(() => {
                  catalogBackReference.current?.focus();
                }, 0);
              }}
              ref={catalogTriggerReference}
              type="button"
            >
              <Grid2x2Icon size={20} />
              <span>Каталог</span>
              <ArrowRightIcon className={styles.drawerLinkArrow} size={16} />
            </button>

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
        ) : (
          <MobileCatalogMenu
            backButtonRef={catalogBackReference}
            categories={categories}
            id={mobileCatalogId}
            isError={categoriesError}
            isPending={categoriesPending}
            onBack={() => {
              setView('main');
              window.setTimeout(() => {
                catalogTriggerReference.current?.focus();
              }, 0);
            }}
            onNavigate={onClose}
          />
        )}
      </div>
    </div>
  );
}

export function Header() {
  useCartHydration();
  useFavoritesHydration();
  const cartLineCount = useCartStore(selectCartLineCount);
  const favoriteCount = useFavoritesStore(selectFavoriteCount);
  const categoriesQuery = useCategoriesQuery();
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const drawerId = useId();
  const drawerTitleId = useId();

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const closeCatalog = useCallback(() => {
    setIsCatalogOpen(false);
  }, []);

  const handleCatalogOpenChange = useCallback((isOpen: boolean) => {
    setIsCatalogOpen(isOpen);
    if (isOpen) setIsMenuOpen(false);
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
            setIsCatalogOpen(false);
            setIsMenuOpen((previous) => !previous);
          }}
          variant="ghost"
        >
          {isMenuOpen ? <CloseIcon size={24} /> : <MenuIcon />}
        </IconButton>

        <BrandMark />

        <nav aria-label="Основная навигация" className={styles.nav}>
          <DesktopCatalogMenu
            categories={categoriesQuery.data ?? []}
            currentPath={location.pathname}
            isActive={location.pathname === '/catalog' || location.pathname.startsWith('/catalog/')}
            isError={categoriesQuery.isError}
            isOpen={isCatalogOpen}
            isPending={categoriesQuery.isPending}
            onNavigate={closeCatalog}
            onOpenChange={handleCatalogOpenChange}
          />
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
          <HeaderSearch onOpen={closeCatalog} shouldClose={isCatalogOpen || isMenuOpen} />
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
      {isMenuOpen ? (
        <MobileMenu
          categories={categoriesQuery.data ?? []}
          categoriesError={categoriesQuery.isError}
          categoriesPending={categoriesQuery.isPending}
          drawerId={drawerId}
          isOpen
          onClose={closeMenu}
          titleId={drawerTitleId}
        />
      ) : null}
    </header>
  );
}
