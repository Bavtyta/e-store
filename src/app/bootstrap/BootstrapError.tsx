import styles from './bootstrap-error.module.css';

interface BootstrapErrorProps {
  message: string;
}

export function BootstrapError({ message }: BootstrapErrorProps) {
  return (
    <main className={styles.root} id="main-content" tabIndex={-1}>
      <p className={styles.eyebrow}>Локальный запуск</p>
      <h1>Не удалось запустить приложение</h1>
      <p>
        Проверьте настройки локальных mock-данных и обновите страницу. Приложение не продолжает
        загрузку, чтобы не показывать неполный интерфейс.
      </p>
      <details className={styles.details}>
        <summary>Техническая информация</summary>
        <pre>{message}</pre>
      </details>
      <button
        className={styles.reload}
        onClick={() => {
          window.location.reload();
        }}
        type="button"
      >
        Обновить страницу
      </button>
    </main>
  );
}
