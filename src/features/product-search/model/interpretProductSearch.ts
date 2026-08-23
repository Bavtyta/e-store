import type { ProductFacet } from '@/entities/product';

export interface ProductSearchInterpretation {
  facetSelections: Readonly<Record<string, readonly string[]>>;
  query: string;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function createOptionPattern(facetCode: string, label: string, value: string): RegExp | null {
  const terms = [...new Set([label.trim(), value.trim()])]
    .filter((term) => term.length > 1)
    .sort((first, second) => second.length - first.length)
    .map(escapeRegExp);

  if (terms.length === 0) {
    return null;
  }

  if (facetCode === 'diameter') {
    const numericTerm = terms.find((term) => /\d/u.test(term));

    if (numericTerm !== undefined) {
      return new RegExp(
        `(^|[\\s,;()])(?:[⌀Øø]\\s*${numericTerm}(?:\\s*мм)?|диаметр\\s*${numericTerm}(?:\\s*мм)?|${numericTerm}\\s*мм)(?=$|[\\s,;()])`,
        'giu',
      );
    }
  }

  return new RegExp(`(^|[\\s,;()])(?:${terms.join('|')})(?=$|[\\s,;()])`, 'giu');
}

export function interpretProductSearch(
  value: string,
  facets: readonly ProductFacet[] | undefined,
): ProductSearchInterpretation {
  let query = value.trim();
  const facetSelections: Record<string, string[]> = {};

  for (const facet of facets ?? []) {
    if (facet.type !== 'checkbox') {
      continue;
    }

    const options = [...(facet.options ?? [])].sort(
      (first, second) => second.label.length - first.label.length,
    );

    for (const option of options) {
      const pattern = createOptionPattern(facet.code, option.label, option.value);

      if (!pattern?.test(query)) {
        continue;
      }

      pattern.lastIndex = 0;
      query = query.replace(pattern, '$1 ');
      (facetSelections[facet.code] ??= []).push(option.value);
    }
  }

  return {
    facetSelections,
    query: query.replace(/[\s,;]+/gu, ' ').trim(),
  };
}
