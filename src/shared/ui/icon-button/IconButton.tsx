import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { classNames } from '@/shared/lib';

import styles from './icon-button.module.css';

export type IconButtonSize = 'small' | 'medium';
export type IconButtonVariant = 'solid' | 'ghost';

export interface IconButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'aria-label'
> {
  children: ReactNode;
  isLoading?: boolean;
  label: string;
  size?: IconButtonSize;
  variant?: IconButtonVariant;
}

export function IconButton({
  children,
  className,
  disabled,
  isLoading = false,
  label,
  size = 'medium',
  type = 'button',
  variant = 'solid',
  ...buttonProps
}: IconButtonProps) {
  return (
    <button
      aria-busy={isLoading || undefined}
      aria-label={label}
      className={classNames(
        styles.root,
        styles[variant],
        styles[size],
        isLoading && styles.loading,
        className,
      )}
      disabled={isLoading ? true : disabled}
      type={type}
      {...buttonProps}
    >
      <span aria-hidden="true" className={styles.icon}>
        {children}
      </span>
      {isLoading ? <span aria-hidden="true" className={styles.spinner} /> : null}
    </button>
  );
}
