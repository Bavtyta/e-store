import type { ComponentPropsWithoutRef } from 'react';

import { classNames } from '@/shared/lib';

import styles from './container.module.css';

export type ContainerSize = 'content' | 'wide';

export interface ContainerProps extends ComponentPropsWithoutRef<'div'> {
  size?: ContainerSize;
}

export function Container({ className, size = 'content', ...containerProps }: ContainerProps) {
  return <div className={classNames(styles.root, styles[size], className)} {...containerProps} />;
}
