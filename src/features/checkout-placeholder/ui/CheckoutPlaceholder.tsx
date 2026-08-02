import { useState } from 'react';

import { Button, Toast } from '@/shared/ui';

import styles from './checkout-placeholder.module.css';

export function CheckoutPlaceholder() {
  const [isMessageVisible, setIsMessageVisible] = useState(false);

  return (
    <div className={styles.root}>
      <Button
        isFullWidth
        onClick={() => {
          setIsMessageVisible(true);
        }}
      >
        Оформить заказ
      </Button>
      {isMessageVisible ? (
        <Toast
          message="Оформление заказа скоро появится. Пока вы можете уточнить наличие и актуальную цену у менеджера."
          onDismiss={() => {
            setIsMessageVisible(false);
          }}
          title="Следующий этап"
        />
      ) : null}
    </div>
  );
}
