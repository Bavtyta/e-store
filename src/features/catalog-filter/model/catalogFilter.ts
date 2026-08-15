export const catalogFilterKeys = {
  diameter: 'filter[diameter]',
  material: 'filter[material]',
  priceMax: 'price_max',
  priceMin: 'price_min',
} as const;

export interface CatalogFilterState {
  diameters: readonly string[];
  material: string | null;
  priceMax: string | null;
  priceMin: string | null;
}

export const emptyCatalogFilterState: CatalogFilterState = {
  diameters: [],
  material: null,
  priceMax: null,
  priceMin: null,
};

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
    material: readParam(searchParams, catalogFilterKeys.material),
    priceMax: readParam(searchParams, catalogFilterKeys.priceMax),
    priceMin: readParam(searchParams, catalogFilterKeys.priceMin),
  };
}

export function isCatalogFilterActive(state: CatalogFilterState): boolean {
  return (
    state.diameters.length > 0 ||
    state.material !== null ||
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

  if (changes.material !== undefined) {
    setParam(catalogFilterKeys.material, changes.material);
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

  next.delete(catalogFilterKeys.diameter);
  next.delete(catalogFilterKeys.material);
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

  if (state.material !== null) {
    filters.material = state.material;
  }

  const priceMin = parsePriceValue(state.priceMin);
  const priceMax = parsePriceValue(state.priceMax);

  return {
    filters,
    ...(priceMin === undefined ? {} : { priceMin }),
    ...(priceMax === undefined ? {} : { priceMax }),
  };
}
