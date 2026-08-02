import { useId } from 'react';
import type { ReactNode } from 'react';

import { Button } from '@/shared/ui/button';

import styles from './error-state.module.css';

export interface ErrorStateProps {
  action?: ReactNode;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  title: string;
}

export function ErrorState({
  action,
  description,
  onRetry,
  retryLabel = 'Повторить',
  title,
}: ErrorStateProps) {
  const titleId = useId();

  return (
    <section aria-labelledby={titleId} className={styles.root} role="alert">
      <span aria-hidden="true" className={styles.icon}>
        !
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
