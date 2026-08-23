import { classNames } from '@/shared/lib';

import styles from './button.module.css';
import type { ButtonSize, ButtonVariant } from './Button';

export function getButtonClassName({
  className,
  isFullWidth,
  isLoading,
  size,
  variant,
}: {
  className: string | undefined;
  isFullWidth: boolean;
  isLoading: boolean;
  size: ButtonSize;
  variant: ButtonVariant;
}): string {
  return classNames(
    styles.root,
    styles[variant],
    styles[size],
    isFullWidth && styles.fullWidth,
    isLoading && styles.loading,
    className,
  );
}
