import type { ComponentPropsWithoutRef } from 'react';

import { classNames } from '@/shared/lib';

import styles from './badge.module.css';

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'error';

export interface BadgeProps extends ComponentPropsWithoutRef<'span'> {
  tone?: BadgeTone;
}

export function Badge({ className, tone = 'neutral', ...badgeProps }: BadgeProps) {
  return <span className={classNames(styles.root, styles[tone], className)} {...badgeProps} />;
}
