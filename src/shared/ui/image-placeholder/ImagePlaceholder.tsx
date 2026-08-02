import type { HTMLAttributes } from 'react';

import { classNames } from '@/shared/lib';

import styles from './image-placeholder.module.css';

export type ImagePlaceholderRatio = 'square' | 'landscape' | 'portrait';

export interface ImagePlaceholderProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'aria-label' | 'children' | 'role'
> {
  alt: string;
  ratio?: ImagePlaceholderRatio;
}

export function ImagePlaceholder({
  alt,
  className,
  ratio = 'landscape',
  ...placeholderProps
}: ImagePlaceholderProps) {
  const isDecorative = alt.length === 0;

  return (
    <div
      aria-hidden={isDecorative || undefined}
      aria-label={isDecorative ? undefined : alt}
      className={classNames(styles.root, styles[ratio], className)}
      role={isDecorative ? undefined : 'img'}
      {...placeholderProps}
    >
      <svg aria-hidden="true" className={styles.icon} focusable="false" viewBox="0 0 48 48">
        <rect height="34" rx="4" width="40" x="4" y="7" />
        <circle cx="17" cy="19" r="4" />
        <path d="m9 36 10-10 7 7 5-5 8 8" />
      </svg>
      <span>{isDecorative ? 'Изображение' : alt}</span>
    </div>
  );
}
