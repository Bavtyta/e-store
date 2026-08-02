import { useId } from 'react';
import type { ComponentPropsWithoutRef } from 'react';

import { classNames } from '@/shared/lib';

import styles from './input.module.css';

export interface InputProps extends Omit<ComponentPropsWithoutRef<'input'>, 'size'> {
  error?: string;
  hint?: string;
  label: string;
}

export function Input({
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  className,
  error,
  hint,
  id,
  label,
  required,
  ...inputProps
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;
  const hasError = error !== undefined && error.length > 0;
  const hasHint = hint !== undefined && hint.length > 0;
  const describedBy = classNames(ariaDescribedBy, hasHint && hintId, hasError && errorId);

  return (
    <div className={styles.root}>
      <label className={styles.label} htmlFor={inputId}>
        {label}
        {required ? (
          <span aria-hidden="true" className={styles.required}>
            {' '}
            *
          </span>
        ) : null}
      </label>
      <input
        aria-describedby={describedBy.length > 0 ? describedBy : undefined}
        aria-errormessage={hasError ? errorId : undefined}
        aria-invalid={hasError ? true : ariaInvalid}
        className={classNames(styles.input, hasError && styles.errorInput, className)}
        id={inputId}
        required={required}
        {...inputProps}
      />
      {hasHint ? (
        <p className={styles.hint} id={hintId}>
          {hint}
        </p>
      ) : null}
      {hasError ? (
        <p className={styles.error} id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
