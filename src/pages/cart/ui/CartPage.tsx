import { Link } from 'react-router';

import { useResolvedCart } from '@/features/resolve-cart';
import { ClearCartButton } from '@/features/clear-cart';
import { appConfig } from '@/shared/config';
import { createPageMetadata, PageMetadata } from '@/shared/lib';
import { Container, EmptyState, ErrorState, Skeleton } from '@/shared/ui';
import { CartContent } from '@/widgets/cart-content';
import { CartSummary } from '@/widgets/cart-summary';

import styles from './cart-page.module.css';

function formatCountLabel(count: number): string {
  const lastTwoDigits = count % 100;
  const lastDigit = count % 10;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return 'товаров';
  if (lastDigit === 1) return 'товар';
  if (lastDigit >= 2 && lastDigit <= 4) return 'товара';

  return 'товаров';
}

const cartMetadata = createPageMetadata(
  {
    canonicalPath: '/cart',
    description: 'Локальная корзина выбранных строительных и промышленных материалов.',
    indexable: false,
    title: 'Корзина',
  },
  appConfig.publicSiteUrl,
);

function CartPageSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Загрузка корзины"
      aria-live="polite"
      className={styles.skeleton}
      role="status"
    >
      <Skeleton height="2.5rem" isDecorative label="Загрузка заголовка корзины" width="12rem" />
      <div className={styles.layout}>
        <Skeleton
          height="18rem"
          isDecorative
          label="Загрузка позиций корзины"
          variant="rectangle"
        />
        <Skeleton height="20rem" isDecorative label="Загрузка итогов корзины" variant="rectangle" />
      </div>
    </div>
  );
}

export function CartPage() {
  const { cart, isEmpty, isError, isLoading, retry } = useResolvedCart();

  return (
    <div className={styles.page}>
      <PageMetadata metadata={cartMetadata} />
      <Container className={styles.content}>
          {isLoading ? (
            <CartPageSkeleton />
          ) : isError ? (
            <ErrorState
              action={<Link to="/catalog">Перейти в каталог</Link>}
              description="Сохранённые позиции не удалены. Проверьте подключение и попробуйте ещё раз."
              onRetry={retry}
              title="Не удалось актуализировать корзину"
            />
          ) : isEmpty ? (
            <EmptyState
              action={<Link to="/catalog">Перейти в каталог</Link>}
              description="Добавьте подходящие товары, и они появятся здесь."
              title="Корзина пуста"
            />
          ) : (
            <>
              <div className={styles.headerRow}>
                <div>
                  <h1 className={styles.heading}>Корзина</h1>
                  <p className={styles.caption}>
                    {cart.lineCount} {formatCountLabel(cart.lineCount)} в корзине
                  </p>
                </div>
                <ClearCartButton />
              </div>
              <p
                aria-atomic="true"
                aria-live="polite"
                className={styles.announcement}
                role="status"
              >
                Корзина актуализирована. Позиций: {cart.lineCount}.
              </p>
              <div className={styles.layout}>
                <CartContent lines={cart.lines} />
                <CartSummary
                  excludedFromTotalCount={cart.excludedFromTotalCount}
                  lineCount={cart.lineCount}
                  totalMinor={cart.totalMinor}
                />
              </div>
            </>
          )}
      </Container>
    </div>
  );
}
