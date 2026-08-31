import type { ProductListItem } from '@/entities/product';
import { HeartIcon } from '@/shared/ui';

import { useFavoritesStore } from '../model/favoritesStore';
import styles from './favorite-toggle-button.module.css';

export interface FavoriteToggleButtonProps {
  product: ProductListItem;
}

export function FavoriteToggleButton({ product }: FavoriteToggleButtonProps) {
  const isFavorite = useFavoritesStore((state) => state.productIds.includes(product.id));
  const toggle = useFavoritesStore((state) => state.toggle);

  return (
    <button
      aria-label={
        isFavorite
          ? `Удалить «${product.name}» из избранного`
          : `Добавить «${product.name}» в избранное`
      }
      aria-pressed={isFavorite}
      className={[styles.root, isFavorite ? styles.active : ''].join(' ').trim()}
      onClick={() => {
        toggle(product.id);
      }}
      title={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
      type="button"
    >
      <HeartIcon size={20} />
    </button>
  );
}
