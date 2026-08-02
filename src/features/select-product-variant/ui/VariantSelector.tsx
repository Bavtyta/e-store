import { useId } from 'react';
import type { KeyboardEvent } from 'react';

import type { VariantOptionGroup } from '@/entities/product';

import type { VariantSelection } from '../model/variantSelection';

import styles from './variant-selector.module.css';

export interface VariantSelectorProps {
  isOptionAvailable: (groupCode: string, value: string) => boolean;
  onOptionSelect: (groupCode: string, value: string) => void;
  optionGroups: readonly VariantOptionGroup[];
  selectedOptions: VariantSelection;
}

function getKeyboardTargetIndex(
  event: KeyboardEvent<HTMLInputElement>,
  currentIndex: number,
  optionCount: number,
): number | null {
  switch (event.key) {
    case 'ArrowDown':
    case 'ArrowRight':
      return (currentIndex + 1) % optionCount;
    case 'ArrowLeft':
    case 'ArrowUp':
      return (currentIndex - 1 + optionCount) % optionCount;
    case 'End':
      return optionCount - 1;
    case 'Home':
      return 0;
    default:
      return null;
  }
}

export function VariantSelector({
  isOptionAvailable,
  onOptionSelect,
  optionGroups,
  selectedOptions,
}: VariantSelectorProps) {
  const selectorId = useId();
  const sortedGroups = [...optionGroups].sort(
    (first, second) => first.sortOrder - second.sortOrder,
  );

  if (sortedGroups.length === 0) {
    return null;
  }

  return (
    <div aria-label="Выбор варианта товара" className={styles.root}>
      {sortedGroups.map((group) => (
        <fieldset className={styles.group} key={group.code}>
          <legend>{group.name}</legend>
          <div className={styles.options}>
            {group.values.map((option) => {
              const isAvailable = isOptionAvailable(group.code, option.value);
              const inputId = `${selectorId}-${group.code}-${option.value}`;

              return (
                <label className={styles.option} htmlFor={inputId} key={option.value}>
                  <input
                    checked={selectedOptions[group.code] === option.value}
                    className={styles.input}
                    disabled={!isAvailable}
                    id={inputId}
                    name={`${selectorId}-${group.code}`}
                    onChange={() => {
                      onOptionSelect(group.code, option.value);
                    }}
                    onKeyDown={(event) => {
                      const availableOptions = group.values.filter((candidate) =>
                        isOptionAvailable(group.code, candidate.value),
                      );
                      const currentIndex = availableOptions.findIndex(
                        (candidate) => candidate.value === option.value,
                      );
                      const targetIndex = getKeyboardTargetIndex(
                        event,
                        currentIndex,
                        availableOptions.length,
                      );

                      if (currentIndex < 0 || targetIndex === null) {
                        return;
                      }

                      const targetOption = availableOptions[targetIndex];

                      if (targetOption === undefined) {
                        return;
                      }

                      event.preventDefault();
                      onOptionSelect(group.code, targetOption.value);

                      const inputs =
                        event.currentTarget
                          .closest('fieldset')
                          ?.querySelectorAll<HTMLInputElement>(
                            'input[type="radio"]:not(:disabled)',
                          ) ?? [];
                      const targetInput = [...inputs].find(
                        (input) => input.value === targetOption.value,
                      );

                      targetInput?.focus();
                    }}
                    type="radio"
                    value={option.value}
                  />
                  <span className={styles.content}>
                    <span>{option.label}</span>
                    {isAvailable ? null : <small className={styles.unavailable}>Недоступно</small>}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}
    </div>
  );
}
