import { useId } from 'react';
import type { ReactNode } from 'react';

import { Button } from '@/shared/ui/button';
import { AlertIcon } from '@/shared/ui/icons';

import styles from './error-state.module.css';

export type ErrorStateVariant = 'page' | 'inline';

export interface ErrorStateProps {
  action?: ReactNode;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  title: string;
  variant?: ErrorStateVariant;
}

export function ErrorState({
  action,
  description,
  onRetry,
  retryLabel = 'Повторить',
  title,
  variant = 'page',
}: ErrorStateProps) {
  const titleId = useId();

  return (
    <section
      aria-labelledby={titleId}
      className={[styles.root, styles[variant]].join(' ').trim()}
      role="alert"
    >
      <span aria-hidden="true" className={styles.icon}>
        <AlertIcon size={24} />
      </span>
      <div className={styles.copy}>
        <h2 id={titleId}>{title}</h2>
        {description === undefined ? null : <p>{description}</p>}
      </div>
      {onRetry === undefined && action === undefined ? null : (
        <div className={styles.actions}>
          {onRetry === undefined ? null : (
            <Button onClick={onRetry} variant="secondary">
              {retryLabel}
            </Button>
          )}
          {action}
        </div>
      )}
    </section>
  );
}
