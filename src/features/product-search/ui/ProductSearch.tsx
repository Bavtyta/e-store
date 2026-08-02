import { useEffect, useState } from 'react';

import { Input } from '@/shared/ui';

export interface ProductSearchProps {
  onSearchChange: (value: string) => void;
  value: string;
}

export function ProductSearch({ onSearchChange, value }: ProductSearchProps) {
  const [draftState, setDraftState] = useState(() => ({
    sourceValue: value,
    value,
  }));
  const inputValue = draftState.sourceValue === value ? draftState.value : value;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (inputValue !== value) {
        onSearchChange(inputValue);
      }
    }, 300);

    return () => {
      window.clearTimeout(timer);
    };
  }, [inputValue, onSearchChange, value]);

  return (
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
  );
}
