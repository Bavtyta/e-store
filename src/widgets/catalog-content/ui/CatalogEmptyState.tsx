import { Button, ButtonLink, EmptyState } from '@/shared/ui';

import type {
  CatalogEmptyBrowseTarget,
  CatalogEmptyReason,
  CatalogRecoveryAction,
} from '../model/catalogEmptyState';
import styles from './catalog-empty-state.module.css';

export interface CatalogEmptyStateProps {
  browseTarget?: CatalogEmptyBrowseTarget;
  onClearFilters?: () => void;
  onClearSearch?: () => void;
  onRecoverySelected?: (action: CatalogRecoveryAction) => void;
  reason: CatalogEmptyReason;
}

const COPY: Readonly<Record<CatalogEmptyReason, { description: string; title: string }>> = {
  catalog: {
    description: 'Ассортимент ещё не опубликован. Вернитесь на главную или загляните позже.',
    title: 'В каталоге пока нет товаров',
  },
  category: {
    description: 'Посмотрите товары в родительской категории или во всём каталоге.',
    title: 'В этой категории пока нет товаров',
  },
  filters: {
    description: 'Ослабьте условия или сбросьте выбранные фильтры.',
    title: 'Фильтры исключили все товары',
  },
  search: {
    description: 'Проверьте написание или попробуйте более короткий запрос.',
    title: 'По запросу ничего не найдено',
  },
  search_and_filters: {
    description:
      'Очистите запрос или сбросьте фильтры — каждое действие сохраняет остальные настройки.',
    title: 'По запросу с выбранными фильтрами ничего нет',
  },
};

export function CatalogEmptyState({
  browseTarget,
  onClearFilters,
  onClearSearch,
  onRecoverySelected,
  reason,
}: CatalogEmptyStateProps) {
  const copy = COPY[reason];
  const showBrowseTarget = reason === 'search' || reason === 'category' || reason === 'catalog';
  const actions = (
    <div className={styles.actions}>
      {reason === 'filters' || reason === 'search_and_filters' ? (
        <Button
          onClick={() => {
            onRecoverySelected?.('clear_filters');
            onClearFilters?.();
          }}
        >
          Сбросить фильтры
        </Button>
      ) : null}
      {reason === 'search' || reason === 'search_and_filters' ? (
        <Button
          onClick={() => {
            onRecoverySelected?.('clear_search');
            onClearSearch?.();
          }}
          variant={reason === 'search' ? 'primary' : 'secondary'}
        >
          Очистить поиск
        </Button>
      ) : null}
      {browseTarget === undefined || !showBrowseTarget ? null : (
        <ButtonLink
          onClick={() => {
            onRecoverySelected?.(browseTarget.action);
          }}
          to={browseTarget.to}
          variant="secondary"
        >
          {browseTarget.label}
        </ButtonLink>
      )}
    </div>
  );

  return (
    <div className={styles.root}>
      <EmptyState
        action={actions}
        description={copy.description}
        icon={null}
        title={copy.title}
        variant="page"
      />
    </div>
  );
}
