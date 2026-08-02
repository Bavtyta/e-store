import { useId } from 'react';
import type { ReactNode } from 'react';

import styles from './empty-state.module.css';

export interface EmptyStateProps {
  action?: ReactNode;
  description?: string;
  title: string;
}

export function EmptyState({ action, description, title }: EmptyStateProps) {
  const titleId = useId();

  return (
    <section
      aria-atomic="true"
      aria-labelledby={titleId}
      aria-live="polite"
      className={styles.root}
      role="status"
    >
      <span aria-hidden="true" className={styles.icon}>
        —
      </span>
      <div className={styles.copy}>
        <h2 id={titleId}>{title}</h2>
        {description === undefined ? null : <p>{description}</p>}
      </div>
      {action === undefined ? null : <div className={styles.action}>{action}</div>}
    </section>
  );
}
