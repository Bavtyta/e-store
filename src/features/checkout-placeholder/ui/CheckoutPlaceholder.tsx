import styles from './checkout-placeholder.module.css';

export function CheckoutPlaceholder() {
  return (
    <div className={styles.root}>
      <strong>Оформление заказа пока недоступно</strong>
      <p>Выбранные позиции сохраняются в корзине на этом устройстве.</p>
    </div>
  );
}
