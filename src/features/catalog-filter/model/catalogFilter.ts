export const catalogFilterKeys = {
  diameter: 'filter[diameter]',
  material: 'filter[material]',
  priceMax: 'price_max',
  priceMin: 'price_min',
} as const;

export interface CatalogFilterState {
  diameters: readonly string[];
  materials: readonly string[];
  priceMax: string | null;
  priceMin: string | null;
}

export type CatalogFacetSelections = Readonly<Record<string, readonly string[]>>;

export interface CatalogFilterCounts {
  groupCount: number;
  valueCount: number;
}

export const emptyCatalogFilterState: CatalogFilterState = {
  diameters: [],
  materials: [],
  priceMax: null,
  priceMin: null,
};

export function getCatalogFilterCounts(
  facetSelections: CatalogFacetSelections,
  state: CatalogFilterState,
): CatalogFilterCounts {
  const facetGroups = Object.values(facetSelections).filter((values) => values.length > 0);
  const priceValueCount = Number(state.priceMin !== null) + Number(state.priceMax !== null);

  return {
    groupCount: facetGroups.length + Number(priceValueCount > 0),
    valueCount: facetGroups.reduce((total, values) => total + values.length, 0) + priceValueCount,
  };
}

function readParam(searchParams: URLSearchParams, key: string): string | null {
  const value = searchParams.get(key);

  return value === null || value.length === 0 ? null : value;
}

export function parseCatalogFilterState(searchParams: URLSearchParams): CatalogFilterState {
  const diameters = (readParam(searchParams, catalogFilterKeys.diameter) ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter((value) => value.length > 0);

  return {
    diameters,
    materials: (readParam(searchParams, catalogFilterKeys.material) ?? '')
      .split(',')
      .map((value) => value.trim())
      .filter((value) => value.length > 0),
    priceMax: readParam(searchParams, catalogFilterKeys.priceMax),
    priceMin: readParam(searchParams, catalogFilterKeys.priceMin),
  };
}

export function parseCatalogAttributeFilters(
  searchParams: URLSearchParams,
): Readonly<Record<string, string>> {
  const filters: Record<string, string> = {};

  for (const [key, value] of searchParams.entries()) {
    const match = /^filter\[([^\]]+)\]$/.exec(key);

    if (match === null || value.trim().length === 0 || match[1] === undefined) {
      continue;
    }

    filters[match[1]] = value;
  }

  return filters;
}

export function parseCatalogFacetSelections(searchParams: URLSearchParams): CatalogFacetSelections {
  return Object.fromEntries(
    Object.entries(parseCatalogAttributeFilters(searchParams)).map(([code, value]) => [
      code,
      value
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item.length > 0),
    ]),
  );
}

export function isCatalogFilterActive(state: CatalogFilterState): boolean {
  return (
    state.diameters.length > 0 ||
    state.materials.length > 0 ||
    state.priceMin !== null ||
    state.priceMax !== null
  );
}

export function applyCatalogFilterChanges(
  searchParams: URLSearchParams,
  changes: Partial<CatalogFilterState>,
): URLSearchParams {
  const next = new URLSearchParams(searchParams);

  function setParam(key: string, value: string | null): void {
    if (value === null || value.length === 0) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
  }

  if (changes.diameters !== undefined) {
    setParam(catalogFilterKeys.diameter, changes.diameters.join(','));
  }

  if (changes.materials !== undefined) {
    setParam(catalogFilterKeys.material, changes.materials.join(','));
  }

  if (changes.priceMin !== undefined) {
    setParam(catalogFilterKeys.priceMin, changes.priceMin);
  }

  if (changes.priceMax !== undefined) {
    setParam(catalogFilterKeys.priceMax, changes.priceMax);
  }

  return next;
}

export function removeCatalogFilterParams(searchParams: URLSearchParams): URLSearchParams {
  const next = new URLSearchParams(searchParams);

  for (const key of [...next.keys()]) {
    if (/^filter\[[^\]]+\]$/.test(key)) {
      next.delete(key);
    }
  }
  next.delete(catalogFilterKeys.priceMin);
  next.delete(catalogFilterKeys.priceMax);

  return next;
}

function parsePriceValue(value: string | null): number | undefined {
  if (value === null) {
    return undefined;
  }

  const trimmedValue = value.trim();

  if (!/^\d+(\.\d+)?$/.test(trimmedValue)) {
    return undefined;
  }

  const parsedValue = Number(trimmedValue);

  return Number.isFinite(parsedValue) ? parsedValue : undefined;
}

export function createProductFilterParams(state: CatalogFilterState): {
  filters: Readonly<Record<string, string>>;
  priceMax?: number;
  priceMin?: number;
} {
  const filters: Record<string, string> = {};

  if (state.diameters.length > 0) {
    filters.diameter = state.diameters.join(',');
  }

  if (state.materials.length > 0) {
    filters.material = state.materials.join(',');
  }

  const priceMin = parsePriceValue(state.priceMin);
  const priceMax = parsePriceValue(state.priceMax);

  return {
    filters,
    ...(priceMin === undefined ? {} : { priceMin }),
    ...(priceMax === undefined ? {} : { priceMax }),
  };
}
