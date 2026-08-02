import type { HTMLAttributes } from 'react';

import { classNames } from '@/shared/lib';

import styles from './toast.module.css';

export type ToastTone = 'info' | 'success' | 'error';

export interface ToastProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'role' | 'title'
> {
  dismissLabel?: string;
  message: string;
  onDismiss?: () => void;
  title?: string;
  tone?: ToastTone;
}

const toneIcon: Record<ToastTone, string> = {
  error: '!',
  info: 'i',
  success: '✓',
};

export function Toast({
  className,
  dismissLabel = 'Закрыть уведомление',
  message,
  onDismiss,
  title,
  tone = 'info',
  ...toastProps
}: ToastProps) {
  const isError = tone === 'error';

  return (
    <div
      aria-atomic="true"
      aria-live={isError ? 'assertive' : 'polite'}
      className={classNames(styles.root, styles[tone], className)}
      role={isError ? 'alert' : 'status'}
      {...toastProps}
    >
      <span aria-hidden="true" className={styles.icon}>
        {toneIcon[tone]}
      </span>
      <div className={styles.copy}>
        {title === undefined ? null : <strong>{title}</strong>}
        <span>{message}</span>
      </div>
      {onDismiss === undefined ? null : (
        <button
          aria-label={dismissLabel}
          className={styles.dismiss}
          onClick={onDismiss}
          type="button"
        >
          <span aria-hidden="true">×</span>
        </button>
      )}
    </div>
  );
}
