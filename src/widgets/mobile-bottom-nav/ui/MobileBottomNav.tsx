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
    <svg aria-hidden="true" fill="none" height="24" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" width="24">
      <path d="M3 10.5 12 3l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 9.5V21h14V9.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 21v-6h6v6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CatalogIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="24" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" width="24">
      <rect height="7" rx="1" width="7" x="3" y="3" />
      <rect height="7" rx="1" width="7" x="14" y="3" />
      <rect height="7" rx="1" width="7" x="3" y="14" />
      <rect height="7" rx="1" width="7" x="14" y="14" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="24" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" width="24">
      <path d="M6 6h15l-1.5 9h-12L5 3H2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="18" cy="20" r="1.5" />
    </svg>
  );
}

function ContactsIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="24" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" width="24">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" strokeLinecap="round" strokeLinejoin="round" />
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
    { icon: <ContactsIcon />, label: 'Контакты', to: '/contacts' },
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
