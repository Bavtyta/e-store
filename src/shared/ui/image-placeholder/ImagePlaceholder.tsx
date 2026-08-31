import type { HTMLAttributes } from 'react';

import { classNames } from '@/shared/lib';
import { ImageIcon } from '@/shared/ui/icons';

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
      <ImageIcon className={styles.icon} />
      <span>{isDecorative ? 'Изображение' : alt}</span>
    </div>
  );
}
