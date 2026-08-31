import type { ReactNode } from 'react';

import { Container, Skeleton } from '@/shared/ui';

import styles from './collection-showcase.module.css';

interface CollectionShowcaseProps {
  action?: ReactNode;
  children: ReactNode;
  description?: string;
  title: string;
  titleId: string;
}

interface CollectionShowcaseGridProps {
  children: ReactNode;
  isLoading?: boolean;
  label?: string;
}

interface CollectionShowcaseStateProps {
  children: ReactNode;
  isError?: boolean;
}

export function CollectionShowcase({
  action,
  children,
  description,
  title,
  titleId,
}: CollectionShowcaseProps) {
  return (
    <section aria-labelledby={titleId} className={styles.section}>
      <Container size="wide">
        <div className={styles.heading}>
          <div>
            <h2 id={titleId}>{title}</h2>
            {description === undefined ? null : <p>{description}</p>}
          </div>
        </div>
        {children}
        {action === undefined ? null : <div className={styles.action}>{action}</div>}
      </Container>
    </section>
  );
}

export function CollectionShowcaseGrid({
  children,
  isLoading = false,
  label,
}: CollectionShowcaseGridProps) {
  return (
    <div
      aria-busy={isLoading || undefined}
      aria-label={label}
      className={styles.grid}
      role={isLoading ? 'status' : undefined}
    >
      {children}
    </div>
  );
}

export function CollectionShowcaseSkeleton({ count = 4 }: { count?: number }) {
  return (
    <CollectionShowcaseGrid isLoading label="Загрузка товаров">
      {Array.from({ length: count }, (_, index) => (
        <Skeleton
          height="31rem"
          isDecorative
          key={index}
          label="Загрузка товара"
          variant="rectangle"
        />
      ))}
    </CollectionShowcaseGrid>
  );
}

export function CollectionShowcaseState({
  children,
  isError = false,
}: CollectionShowcaseStateProps) {
  return (
    <div className={styles.state} role={isError ? 'alert' : 'status'}>
      {children}
    </div>
  );
}
