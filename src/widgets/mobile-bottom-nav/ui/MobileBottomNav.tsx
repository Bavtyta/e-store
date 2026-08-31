import { NavLink } from 'react-router';

import { selectCartLineCount, useCartStore } from '@/entities/cart';
import { CartIcon, Grid2x2Icon, HeartIcon, HomeIcon } from '@/shared/ui';

import styles from './mobile-bottom-nav.module.css';

interface NavItem {
  ariaLabel?: string;
  label: string;
  to: string;
  end?: boolean;
  icon: React.ReactNode;
  badge?: number;
}

export function MobileBottomNav() {
  const cartLineCount = useCartStore(selectCartLineCount);
  const cartLabel = cartLineCount > 0 ? `В корзине позиций: ${String(cartLineCount)}` : 'Корзина';

  const items: NavItem[] = [
    { icon: <HomeIcon />, label: 'Главная', to: '/' },
    { icon: <Grid2x2Icon size={24} />, label: 'Каталог', to: '/catalog' },
    {
      ariaLabel: cartLabel,
      badge: cartLineCount,
      icon: <CartIcon size={24} />,
      label: 'Корзина',
      to: '/cart',
    },
    { icon: <HeartIcon size={24} />, label: 'Избранное', to: '/favorites' },
  ];

  return (
    <nav aria-label="Мобильная навигация" className={styles.root}>
      <ul className={styles.list}>
        {items.map((item) => (
          <li className={styles.item} key={item.to}>
            <NavLink
              aria-label={item.ariaLabel}
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
