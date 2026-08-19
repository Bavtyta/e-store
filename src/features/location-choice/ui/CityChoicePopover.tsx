import { useEffect, useId, useRef, useState } from 'react';

import {
  AVAILABLE_CITIES,
  LOCATION_SESSION_DISMISSED_KEY,
  readLocationChoice,
  writeLocationChoice,
} from '../model/locationChoice';
import type { AvailableCity } from '../model/locationChoice';
import styles from './city-choice-popover.module.css';

interface CityChoicePopoverProps {
  buttonClassName?: string | undefined;
  className?: string | undefined;
}

export function CityChoicePopover({
  buttonClassName = '',
  className = '',
}: CityChoicePopoverProps) {
  const [initialChoice] = useState(() => readLocationChoice(window.localStorage));
  const initialCity = initialChoice?.city ?? 'Тольятти';
  const [city, setCity] = useState<AvailableCity>(initialCity);
  const [draftCity, setDraftCity] = useState<AvailableCity>(initialCity);
  const [isOpen, setIsOpen] = useState(
    () =>
      initialChoice === null &&
      window.sessionStorage.getItem(LOCATION_SESSION_DISMISSED_KEY) === null,
  );
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const titleId = useId();

  useEffect(() => {
    if (initialChoice === null && isOpen) {
      window.sessionStorage.setItem(LOCATION_SESSION_DISMISSED_KEY, 'true');
    }
  }, [initialChoice, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: PointerEvent): void {
      const target = event.target;

      if (target instanceof Node && !rootRef.current?.contains(target)) setIsOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key !== 'Escape') return;

      setIsOpen(false);
      triggerRef.current?.focus();
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  function closePopover(): void {
    setIsOpen(false);
    triggerRef.current?.focus();
  }

  function confirmCity(): void {
    writeLocationChoice(window.localStorage, draftCity);
    setCity(draftCity);
    closePopover();
  }

  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')} ref={rootRef}>
      <button
        aria-controls={panelId}
        aria-expanded={isOpen}
        className={buttonClassName}
        onClick={() => {
          setDraftCity(city);
          setIsOpen((currentValue) => !currentValue);
        }}
        ref={triggerRef}
        type="button"
      >
        <span className={styles.cityPrefix}>Ваш город:</span> {city}
      </button>
      {isOpen ? (
        <div aria-labelledby={titleId} className={styles.popover} id={panelId} role="dialog">
          <div className={styles.heading}>
            <h2 id={titleId}>Выберите город</h2>
            <p>Доставляем из Тольятти по Самарской области.</p>
          </div>
          <label className={styles.field}>
            <span>Город</span>
            <select
              onChange={(event) => {
                setDraftCity(event.currentTarget.value as AvailableCity);
              }}
              value={draftCity}
            >
              {AVAILABLE_CITIES.map((availableCity) => (
                <option key={availableCity} value={availableCity}>
                  {availableCity}
                </option>
              ))}
            </select>
          </label>
          <div className={styles.actions}>
            <button className={styles.confirm} onClick={confirmCity} type="button">
              Подтвердить
            </button>
            <button className={styles.later} onClick={closePopover} type="button">
              Позже
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
