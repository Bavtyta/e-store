import type { ButtonHTMLAttributes } from 'react';

import styles from './button.module.css';
import { getButtonClassName } from './buttonStyles';

export type ButtonSize = 'small' | 'medium';
export type ButtonVariant = 'primary' | 'secondary' | 'danger';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isFullWidth?: boolean;
  isLoading?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant;
}

export function Button({
  children,
  className,
  disabled,
  isFullWidth = false,
  isLoading = false,
  size = 'medium',
  type = 'button',
  variant = 'primary',
  ...buttonProps
}: ButtonProps) {
  return (
    <button
      aria-busy={isLoading || undefined}
      className={getButtonClassName({
        className,
        isFullWidth,
        isLoading,
        size,
        variant,
      })}
      disabled={isLoading ? true : disabled}
      type={type}
      {...buttonProps}
    >
      {isLoading ? <span aria-hidden="true" className={styles.spinner} /> : null}
      <span className={styles.label}>{children}</span>
    </button>
  );
}
