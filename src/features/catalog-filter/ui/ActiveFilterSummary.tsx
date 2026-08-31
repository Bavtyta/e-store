import type { ProductFacet } from '@/entities/product';
import { CloseIcon } from '@/shared/ui';

import type { CatalogFacetSelections, CatalogFilterState } from '../model/catalogFilter';

import styles from './catalog-filter-panel.module.css';

export interface ActiveFilterSummaryProps {
  facetSelections?: CatalogFacetSelections;
  facets?: readonly ProductFacet[];
  onFacetChange?: (code: string, values: readonly string[]) => void;
  onFiltersChange: (changes: Partial<CatalogFilterState>) => void;
  onReset: () => void;
  state: CatalogFilterState;
}

function ActiveFilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <li>
      <button
        aria-label={`Убрать фильтр: ${label}`}
        className={styles.chip}
        onClick={onRemove}
        type="button"
      >
        <span>{label}</span>
        <CloseIcon />
      </button>
    </li>
  );
}

export function ActiveFilterSummary({
  facetSelections = {},
  facets,
  onFacetChange,
  onFiltersChange,
  onReset,
  state,
}: ActiveFilterSummaryProps) {
  const selectedDynamicOptions = (facets ?? [])
    .filter((facet) => facet.code !== 'diameter' && facet.code !== 'material')
    .flatMap((facet) =>
      (facet.options ?? [])
        .filter((option) => facetSelections[facet.code]?.includes(option.value))
        .map((option) => ({ facet, option })),
    );
  const hasActiveFilters =
    state.diameters.length > 0 ||
    state.materials.length > 0 ||
    state.priceMin !== null ||
    state.priceMax !== null ||
    selectedDynamicOptions.length > 0;

  if (!hasActiveFilters) {
    return null;
  }

  return (
    <section aria-label="Выбранные фильтры" className={styles.activeFilters}>
      <div className={styles.summaryHeader}>
        <strong>Выбранные фильтры</strong>
        <button className={styles.clearSummary} onClick={onReset} type="button">
          Сбросить все
        </button>
      </div>
      <ul>
        {state.diameters.map((value) => (
          <ActiveFilterChip
            key={`diameter-${value}`}
            label={`Диаметр: ${value} мм`}
            onRemove={() => {
              onFiltersChange({
                diameters: state.diameters.filter((item) => item !== value),
              });
            }}
          />
        ))}
        {state.materials.map((material) => (
          <ActiveFilterChip
            key={`material-${material}`}
            label={`Материал: ${material}`}
            onRemove={() => {
              onFiltersChange({
                materials: state.materials.filter((item) => item !== material),
              });
            }}
          />
        ))}
        {state.priceMin === null ? null : (
          <ActiveFilterChip
            label={`Цена от: ${state.priceMin} ₽`}
            onRemove={() => {
              onFiltersChange({ priceMin: null });
            }}
          />
        )}
        {state.priceMax === null ? null : (
          <ActiveFilterChip
            label={`Цена до: ${state.priceMax} ₽`}
            onRemove={() => {
              onFiltersChange({ priceMax: null });
            }}
          />
        )}
        {selectedDynamicOptions.map(({ facet, option }) => (
          <ActiveFilterChip
            key={`${facet.code}-${option.value}`}
            label={`${facet.name}: ${option.label}`}
            onRemove={() => {
              const values = (facet.options ?? [])
                .filter(
                  (item) =>
                    facetSelections[facet.code]?.includes(item.value) &&
                    item.value !== option.value,
                )
                .map((item) => item.value);
              onFacetChange?.(facet.code, values);
            }}
          />
        ))}
      </ul>
    </section>
  );
}
