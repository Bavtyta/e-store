import { useEffect, useId, useState } from 'react';
import type { ReactNode } from 'react';

import type { ProductFacet } from '@/entities/product';
import { Button, CloseIcon, MinusIcon, PlusIcon } from '@/shared/ui';

import { isCatalogFilterActive } from '../model/catalogFilter';
import type { CatalogFacetSelections, CatalogFilterState } from '../model/catalogFilter';

import styles from './catalog-filter-panel.module.css';

export interface CatalogFilterPanelProps {
  facetSelections?: CatalogFacetSelections;
  facets?: readonly ProductFacet[];
  headingLevel?: 2 | 3;
  onFacetChange?: (code: string, values: readonly string[]) => void;
  onFiltersChange: (changes: Partial<CatalogFilterState>) => void;
  onReset: () => void;
  showActiveFilters?: boolean;
  state: CatalogFilterState;
}

const DIAMETER_OPTIONS = ['25', '32', '50', '110'] as const;
const MATERIAL_OPTIONS = ['ПНД', 'ПВХ', 'Полипропилен', 'Сталь'] as const;

function normalizePriceDraft(value: string): string | null {
  const trimmedValue = value.trim();

  return trimmedValue.length === 0 ? null : trimmedValue;
}

interface PriceRangeProps {
  onFiltersChange: (changes: Partial<CatalogFilterState>) => void;
  state: CatalogFilterState;
}

function PriceRange({ onFiltersChange, state }: PriceRangeProps) {
  const errorId = useId();
  const [minDraft, setMinDraft] = useState(state.priceMin ?? '');
  const [maxDraft, setMaxDraft] = useState(state.priceMax ?? '');
  const [previousState, setPreviousState] = useState(state);
  const hasInvalidRange =
    minDraft.trim().length > 0 && maxDraft.trim().length > 0 && Number(minDraft) > Number(maxDraft);

  if (previousState !== state) {
    setPreviousState(state);
    setMinDraft(state.priceMin ?? '');
    setMaxDraft(state.priceMax ?? '');
  }

  useEffect(() => {
    if (hasInvalidRange) {
      return;
    }

    const timer = window.setTimeout(() => {
      const nextMin = normalizePriceDraft(minDraft);
      const nextMax = normalizePriceDraft(maxDraft);

      if (nextMin === state.priceMin && nextMax === state.priceMax) {
        return;
      }

      onFiltersChange({ priceMax: nextMax, priceMin: nextMin });
    }, 500);

    return () => {
      window.clearTimeout(timer);
    };
  }, [hasInvalidRange, maxDraft, minDraft, onFiltersChange, state.priceMax, state.priceMin]);

  return (
    <div className={styles.row}>
      <input
        aria-describedby={hasInvalidRange ? errorId : undefined}
        aria-invalid={hasInvalidRange || undefined}
        aria-label="Цена от, руб"
        className={styles.input}
        inputMode="decimal"
        min="0"
        onChange={(event) => {
          setMinDraft(event.target.value);
        }}
        placeholder="От"
        step="0.01"
        type="number"
        value={minDraft}
      />
      <span className={styles.dash}>–</span>
      <input
        aria-describedby={hasInvalidRange ? errorId : undefined}
        aria-invalid={hasInvalidRange || undefined}
        aria-label="Цена до, руб"
        className={styles.input}
        inputMode="decimal"
        min="0"
        onChange={(event) => {
          setMaxDraft(event.target.value);
        }}
        placeholder="До"
        step="0.01"
        type="number"
        value={maxDraft}
      />
      {hasInvalidRange ? (
        <p className={styles.rangeError} id={errorId} role="alert">
          Цена «от» не должна быть выше цены «до».
        </p>
      ) : null}
    </div>
  );
}

function DynamicFacetGroup({
  facet,
  onChange,
  selectedValues,
}: {
  facet: ProductFacet;
  onChange: (values: readonly string[]) => void;
  selectedValues: readonly string[];
}) {
  const baseId = useId();

  function toggleValue(value: string): void {
    onChange(
      selectedValues.includes(value)
        ? selectedValues.filter((item) => item !== value)
        : [...selectedValues, value],
    );
  }

  return (
    <FilterGroup
      {...(selectedValues.length === 0
        ? {}
        : {
            onClear: () => {
              onChange([]);
            },
          })}
      title={facet.name}
    >
      <fieldset>
        <legend className={styles.visuallyHidden}>{facet.name}</legend>
        <div className={styles.checks}>
          {(facet.options ?? []).map((option, index) => {
            const controlId = `${baseId}-option-${String(index)}`;

            return (
              <div className={styles.check} key={option.value}>
                <input
                  checked={selectedValues.includes(option.value)}
                  disabled={option.count === 0 && !selectedValues.includes(option.value)}
                  id={controlId}
                  onChange={() => {
                    toggleValue(option.value);
                  }}
                  type="checkbox"
                />
                <label htmlFor={controlId}>
                  <span>{option.label}</span>
                  <span aria-hidden="true" className={styles.optionCount}>
                    {option.count}
                  </span>
                  <span className={styles.visuallyHidden}>, товаров: {option.count}</span>
                </label>
              </div>
            );
          })}
        </div>
      </fieldset>
    </FilterGroup>
  );
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

function FilterGroup({
  children,
  defaultOpen = true,
  onClear,
  title,
}: {
  children: ReactNode;
  defaultOpen?: boolean;
  onClear?: () => void;
  title: string;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <details
      className={styles.group}
      onToggle={(event) => {
        setIsOpen(event.currentTarget.open);
      }}
      open={isOpen}
    >
      <summary className={styles.groupSummary}>
        <span>{title}</span>
        <span aria-hidden="true" className={styles.groupIcon}>
          {isOpen ? <MinusIcon /> : <PlusIcon />}
        </span>
      </summary>
      <div className={styles.groupBody}>
        {onClear === undefined ? null : (
          <button
            aria-label={`Очистить группу «${title}»`}
            className={styles.clearGroup}
            onClick={onClear}
            type="button"
          >
            Очистить
          </button>
        )}
        {children}
      </div>
    </details>
  );
}

export function CatalogFilterPanel({
  facetSelections = {},
  facets,
  headingLevel = 2,
  onFacetChange,
  onFiltersChange,
  onReset,
  showActiveFilters = true,
  state,
}: CatalogFilterPanelProps) {
  const baseId = useId();
  const filterTitleId = `${baseId}-title`;
  const activeFilterCount =
    state.diameters.length +
    state.materials.length +
    (state.priceMin === null && state.priceMax === null ? 0 : 1);
  const dynamicFacets = (facets ?? []).filter(
    (facet) => facet.type === 'checkbox' && facet.code !== 'diameter' && facet.code !== 'material',
  );
  const diameterFacet = (facets ?? []).find(
    (facet) => facet.type === 'checkbox' && facet.code === 'diameter',
  );
  const materialFacet = (facets ?? []).find(
    (facet) => facet.type === 'checkbox' && facet.code === 'material',
  );
  const lengthFacet = dynamicFacets.find((facet) => facet.code === 'length');
  const availabilityFacet = dynamicFacets.find((facet) => facet.code === 'availability');
  const additionalFacets = dynamicFacets.filter(
    (facet) => facet.code !== 'length' && facet.code !== 'availability',
  );
  const totalActiveFilterCount =
    activeFilterCount +
    dynamicFacets.reduce((count, facet) => count + (facetSelections[facet.code]?.length ?? 0), 0);
  const selectedDynamicOptions = dynamicFacets.flatMap((facet) =>
    (facet.options ?? [])
      .filter((option) => facetSelections[facet.code]?.includes(option.value))
      .map((option) => ({ facet, option })),
  );

  function toggleDiameter(value: string): void {
    const isSelected = state.diameters.includes(value);

    onFiltersChange({
      diameters: isSelected
        ? state.diameters.filter((item) => item !== value)
        : [...state.diameters, value],
    });
  }

  const Heading = headingLevel === 2 ? 'h2' : 'h3';

  return (
    <section aria-labelledby={filterTitleId} className={styles.root}>
      <Heading className={styles.title} id={filterTitleId}>
        Фильтры
        {totalActiveFilterCount > 0 ? (
          <span className={styles.activeCount}>Выбрано: {totalActiveFilterCount}</span>
        ) : null}
      </Heading>

      {showActiveFilters && totalActiveFilterCount > 0 ? (
        <div aria-label="Выбранные фильтры" className={styles.activeFilters}>
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
                  const values = (facetSelections[facet.code] ?? []).filter(
                    (value) => value !== option.value,
                  );
                  onFacetChange?.(facet.code, values);
                }}
              />
            ))}
          </ul>
        </div>
      ) : null}

      {diameterFacet === undefined ? (
        <FilterGroup
          {...(state.diameters.length === 0
            ? {}
            : {
                onClear: () => {
                  onFiltersChange({ diameters: [] });
                },
              })}
          title="Диаметр, мм"
        >
          <fieldset>
            <legend className={styles.visuallyHidden}>Диаметр, мм</legend>
            <div className={styles.checks}>
              {DIAMETER_OPTIONS.map((value) => {
                const controlId = `${baseId}-diameter-${value}`;
                const isChecked = state.diameters.includes(value);

                return (
                  <div className={styles.check} key={value}>
                    <input
                      checked={isChecked}
                      id={controlId}
                      onChange={() => {
                        toggleDiameter(value);
                      }}
                      type="checkbox"
                    />
                    <label htmlFor={controlId}>{value}</label>
                  </div>
                );
              })}
            </div>
          </fieldset>
        </FilterGroup>
      ) : (
        <DynamicFacetGroup
          facet={diameterFacet}
          onChange={(values) => {
            onFacetChange?.(diameterFacet.code, values);
          }}
          selectedValues={facetSelections[diameterFacet.code] ?? []}
        />
      )}

      <FilterGroup
        {...(state.priceMin === null && state.priceMax === null
          ? {}
          : {
              onClear: () => {
                onFiltersChange({ priceMax: null, priceMin: null });
              },
            })}
        title="Цена, руб"
      >
        <fieldset>
          <legend className={styles.visuallyHidden}>Цена, руб</legend>
          <PriceRange onFiltersChange={onFiltersChange} state={state} />
        </fieldset>
      </FilterGroup>

      {materialFacet === undefined ? (
        <FilterGroup
          {...(state.materials.length === 0
            ? {}
            : {
                onClear: () => {
                  onFiltersChange({ materials: [] });
                },
              })}
          title="Материал"
        >
          <fieldset>
            <legend className={styles.visuallyHidden}>Материал</legend>
            <div className={styles.checks}>
              {MATERIAL_OPTIONS.map((option) => {
                const controlId = `${baseId}-material-${option}`;

                return (
                  <div className={styles.check} key={option}>
                    <input
                      checked={state.materials.includes(option)}
                      id={controlId}
                      onChange={() => {
                        onFiltersChange({
                          materials: state.materials.includes(option)
                            ? state.materials.filter((item) => item !== option)
                            : [...state.materials, option],
                        });
                      }}
                      type="checkbox"
                    />
                    <label htmlFor={controlId}>{option}</label>
                  </div>
                );
              })}
            </div>
          </fieldset>
        </FilterGroup>
      ) : (
        <DynamicFacetGroup
          facet={materialFacet}
          onChange={(values) => {
            onFacetChange?.(materialFacet.code, values);
          }}
          selectedValues={facetSelections[materialFacet.code] ?? []}
        />
      )}

      {lengthFacet === undefined ? null : (
        <DynamicFacetGroup
          facet={lengthFacet}
          onChange={(values) => {
            onFacetChange?.(lengthFacet.code, values);
          }}
          selectedValues={facetSelections[lengthFacet.code] ?? []}
        />
      )}

      {availabilityFacet === undefined ? null : (
        <DynamicFacetGroup
          facet={availabilityFacet}
          onChange={(values) => {
            onFacetChange?.(availabilityFacet.code, values);
          }}
          selectedValues={facetSelections[availabilityFacet.code] ?? []}
        />
      )}

      {additionalFacets.map((facet) => (
        <DynamicFacetGroup
          facet={facet}
          key={facet.code}
          onChange={(values) => {
            onFacetChange?.(facet.code, values);
          }}
          selectedValues={facetSelections[facet.code] ?? []}
        />
      ))}

      {isCatalogFilterActive(state) || totalActiveFilterCount > 0 ? (
        <Button
          isFullWidth
          onClick={() => {
            onReset();
          }}
          variant="secondary"
        >
          Сбросить фильтры
        </Button>
      ) : null}
    </section>
  );
}
