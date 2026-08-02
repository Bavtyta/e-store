import type { ChangeEvent } from 'react';

import { productSortSchema } from '@/entities/product';
import type { ProductSort } from '@/entities/product';

import styles from './product-sorting.module.css';

export interface ProductSortingProps {
  onSortChange: (sort: ProductSort) => void;
  value: ProductSort;
}

export function ProductSorting({ onSortChange, value }: ProductSortingProps) {
  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const result = productSortSchema.safeParse(event.target.value);

    if (result.success) {
      onSortChange(result.data);
    }
  }

  return (
    <label className={styles.root}>
      <span>Сортировка</span>
      <select onChange={handleChange} value={value}>
        <option value="relevance">По релевантности</option>
        <option value="price_asc">Сначала дешевле</option>
        <option value="price_desc">Сначала дороже</option>
        <option value="name_asc">По названию: А–Я</option>
        <option value="name_desc">По названию: Я–А</option>
      </select>
    </label>
  );
}
