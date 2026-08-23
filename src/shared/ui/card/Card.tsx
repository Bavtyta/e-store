import type { ComponentPropsWithoutRef } from 'react';

import { classNames } from '@/shared/lib';

import styles from './card.module.css';

export type CardPadding = 'none' | 'compact' | 'comfortable';
export type CardVariant = 'outlined' | 'elevated';

export interface CardProps extends ComponentPropsWithoutRef<'div'> {
  padding?: CardPadding;
  variant?: CardVariant;
}

export function Card({
  className,
  padding = 'comfortable',
  variant = 'outlined',
  ...cardProps
}: CardProps) {
  return (
    <div
      className={classNames(styles.root, styles[padding], styles[variant], className)}
      {...cardProps}
    />
  );
}
