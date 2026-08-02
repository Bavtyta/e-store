import { useState } from 'react';

import type { ProductVariant } from '@/entities/product';

import {
  findSelectedVariant,
  getInitialVariantSelection,
  isVariantOptionAvailable,
  resolveVariantOptionSelection,
} from './variantSelection';
import type { VariantSelection } from './variantSelection';

export function useProductVariantSelection(variants: readonly ProductVariant[]) {
  const [selectedOptions, setSelectedOptions] = useState<VariantSelection>(() =>
    getInitialVariantSelection(variants),
  );
  const selectedVariant = findSelectedVariant(variants, selectedOptions);

  return {
    isOptionAvailable: (groupCode: string, value: string) =>
      isVariantOptionAvailable(variants, selectedOptions, groupCode, value),
    selectOption: (groupCode: string, value: string) => {
      setSelectedOptions((currentSelection) =>
        resolveVariantOptionSelection(variants, currentSelection, groupCode, value),
      );
    },
    selectedOptions,
    selectedVariant,
  };
}
