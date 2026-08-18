import { NavLink } from 'react-router';

import { selectCartLineCount, useCartStore } from '@/entities/cart';

import styles from './mobile-bottom-nav.module.css';

interface NavItem {
  label: string;
  to: string;
  end?: boolean;
  icon: React.ReactNode;
  badge?: number;
}

function HomeIcon() {
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
      <path d="M3 10.5 12 3l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 9.5V21h14V9.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 21v-6h6v6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CatalogIcon() {
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
      <rect height="7" rx="1" width="7" x="3" y="3" />
      <rect height="7" rx="1" width="7" x="14" y="3" />
      <rect height="7" rx="1" width="7" x="3" y="14" />
      <rect height="7" rx="1" width="7" x="14" y="14" />
    </svg>
  );
}

function CartIcon() {
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
      <path d="M6 6h15l-1.5 9h-12L5 3H2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="18" cy="20" r="1.5" />
    </svg>
  );
}

function FavoritesIcon() {
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
      <path
        d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MobileBottomNav() {
  const cartLineCount = useCartStore(selectCartLineCount);

  const items: NavItem[] = [
    { icon: <HomeIcon />, label: 'Главная', to: '/' },
    { icon: <CatalogIcon />, label: 'Каталог', to: '/catalog' },
    {
      badge: cartLineCount,
      icon: <CartIcon />,
      label: 'Корзина',
      to: '/cart',
    },
    { icon: <FavoritesIcon />, label: 'Избранное', to: '/favorites' },
  ];

  return (
    <nav aria-label="Мобильная навигация" className={styles.root}>
      <ul className={styles.list}>
        {items.map((item) => (
          <li className={styles.item} key={item.to}>
            <NavLink
              className={({ isActive }) =>
                [styles.link, isActive ? styles.linkActive : ''].join(' ').trim()
              }
              end={item.to === '/'}
              to={item.to}
            >
              <span className={styles.iconWrap}>
                {item.icon}
                {item.badge !== undefined && item.badge > 0 ? (
                  <span className={styles.badge}>{item.badge > 99 ? '99+' : item.badge}</span>
                ) : null}
              </span>
              <span className={styles.label}>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
