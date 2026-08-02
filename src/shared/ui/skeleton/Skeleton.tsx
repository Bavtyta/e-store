import type { CSSProperties, HTMLAttributes } from 'react';

import { classNames } from '@/shared/lib';

import styles from './skeleton.module.css';

export type SkeletonVariant = 'text' | 'rectangle' | 'circle';

export interface SkeletonProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  height?: CSSProperties['height'];
  isDecorative?: boolean;
  label?: string;
  variant?: SkeletonVariant;
  width?: CSSProperties['width'];
}

export function Skeleton({
  className,
  height,
  isDecorative = false,
  label = 'Загрузка',
  style,
  variant = 'text',
  width,
  ...skeletonProps
}: SkeletonProps) {
  return (
    <div
      aria-busy={isDecorative ? undefined : 'true'}
      aria-hidden={isDecorative || undefined}
      aria-label={isDecorative ? undefined : label}
      aria-live={isDecorative ? undefined : 'polite'}
      className={classNames(styles.root, styles[variant], className)}
      role={isDecorative ? undefined : 'status'}
      style={{ ...style, height, width }}
      {...skeletonProps}
    />
  );
}
