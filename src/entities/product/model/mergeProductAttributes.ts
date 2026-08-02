import type { Attribute } from './product';

export function mergeProductAttributes(
  productAttributes: readonly Attribute[],
  variantAttributes: readonly Attribute[],
): Attribute[] {
  const attributesByCode = new Map<string, Attribute>();

  for (const attribute of productAttributes) {
    attributesByCode.set(attribute.code, attribute);
  }

  for (const attribute of variantAttributes) {
    attributesByCode.set(attribute.code, attribute);
  }

  return [...attributesByCode.values()].sort(
    (first, second) =>
      first.sortOrder - second.sortOrder || first.name.localeCompare(second.name, 'ru-RU'),
  );
}
