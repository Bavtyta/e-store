import { useEffect, useId, useState } from 'react';

import { Button } from '@/shared/ui';

import { isCatalogFilterActive } from '../model/catalogFilter';
import type { CatalogFilterState } from '../model/catalogFilter';

import styles from './catalog-filter-panel.module.css';

export interface CatalogFilterPanelProps {
  onFiltersChange: (changes: Partial<CatalogFilterState>) => void;
  onReset: () => void;
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
  const [minDraft, setMinDraft] = useState(state.priceMin ?? '');
  const [maxDraft, setMaxDraft] = useState(state.priceMax ?? '');
  const [previousState, setPreviousState] = useState(state);

  if (previousState !== state) {
    setPreviousState(state);
    setMinDraft(state.priceMin ?? '');
    setMaxDraft(state.priceMax ?? '');
  }

  useEffect(() => {
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
  }, [maxDraft, minDraft, onFiltersChange, state.priceMax, state.priceMin]);

  return (
    <div className={styles.row}>
      <input
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
    </div>
  );
}

export function CatalogFilterPanel({ onFiltersChange, onReset, state }: CatalogFilterPanelProps) {
  const baseId = useId();
  const filterTitleId = `${baseId}-title`;

  function toggleDiameter(value: string): void {
    const isSelected = state.diameters.includes(value);

    onFiltersChange({
      diameters: isSelected
        ? state.diameters.filter((item) => item !== value)
        : [...state.diameters, value],
    });
  }

  return (
    <section aria-labelledby={filterTitleId} className={styles.root}>
      <h3 className={styles.title} id={filterTitleId}>
        Фильтры
      </h3>

      <fieldset className={styles.group}>
        <legend className={styles.label}>Диаметр, мм</legend>
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

      <fieldset className={styles.group}>
        <legend className={styles.label}>Цена, руб</legend>
        <PriceRange onFiltersChange={onFiltersChange} state={state} />
      </fieldset>

      <div className={styles.group}>
        <label className={styles.label} htmlFor={`${baseId}-material`}>
          Материал
        </label>
        <select
          className={styles.select}
          id={`${baseId}-material`}
          onChange={(event) => {
            onFiltersChange({ material: event.target.value.length === 0 ? null : event.target.value });
          }}
          value={state.material ?? ''}
        >
          <option value="">Любой</option>
          {MATERIAL_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      {isCatalogFilterActive(state) ? (
        <Button isFullWidth onClick={onReset} variant="secondary">
          Сбросить фильтры
        </Button>
      ) : null}
    </section>
  );
}
