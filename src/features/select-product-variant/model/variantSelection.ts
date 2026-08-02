import type { ProductVariant } from '@/entities/product';

export type VariantSelection = Readonly<Record<string, string>>;

export function isVariantSelectable(variant: ProductVariant): boolean {
  return variant.availability.status !== 'out_of_stock';
}

export function createVariantSelection(variant: ProductVariant): VariantSelection {
  return Object.fromEntries(variant.optionValues.map((option) => [option.code, option.value]));
}

function matchesSelection(variant: ProductVariant, selection: VariantSelection): boolean {
  return Object.entries(selection).every(([code, value]) =>
    variant.optionValues.some((option) => option.code === code && option.value === value),
  );
}

export function findSelectedVariant(
  variants: readonly ProductVariant[],
  selection: VariantSelection,
): ProductVariant | null {
  return (
    variants.find(
      (variant) => isVariantSelectable(variant) && matchesSelection(variant, selection),
    ) ?? null
  );
}

export function getInitialVariantSelection(variants: readonly ProductVariant[]): VariantSelection {
  const initialVariant = variants.find(isVariantSelectable);

  return initialVariant === undefined ? {} : createVariantSelection(initialVariant);
}

export function isVariantOptionAvailable(
  variants: readonly ProductVariant[],
  selection: VariantSelection,
  groupCode: string,
  value: string,
): boolean {
  return (
    findSelectedVariant(variants, {
      ...selection,
      [groupCode]: value,
    }) !== null
  );
}

export function resolveVariantOptionSelection(
  variants: readonly ProductVariant[],
  selection: VariantSelection,
  groupCode: string,
  value: string,
): VariantSelection {
  const variant = findSelectedVariant(variants, {
    ...selection,
    [groupCode]: value,
  });

  return variant === null ? selection : createVariantSelection(variant);
}
