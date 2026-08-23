import { useState } from 'react';

import { Button, Input } from '@/shared/ui';

import styles from './product-search.module.css';

export interface ProductSearchProps {
  onSearchSubmit: (value: string) => void;
  value: string;
}

export function ProductSearch({ onSearchSubmit, value }: ProductSearchProps) {
  const [draftState, setDraftState] = useState(() => ({
    sourceValue: value,
    value,
  }));
  const inputValue = draftState.sourceValue === value ? draftState.value : value;

  return (
    <form
      aria-label="Поиск товаров в каталоге"
      className={styles.root}
      onSubmit={(event) => {
        event.preventDefault();
        setDraftState({
          sourceValue: inputValue,
          value: inputValue,
        });
        onSearchSubmit(inputValue);
      }}
      role="search"
    >
      <Input
        label="Поиск товаров"
        onChange={(event) => {
          setDraftState({
            sourceValue: value,
            value: event.target.value,
          });
        }}
        placeholder="Название, материал или артикул"
        type="search"
        value={inputValue}
      />
      <Button type="submit">Найти</Button>
    </form>
  );
}
