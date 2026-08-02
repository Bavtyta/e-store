import styles from './placeholder.module.css';

interface PlaceholderProps {
  title: string;
}

export function Placeholder({ title }: PlaceholderProps) {
  return (
    <main className={styles.root} id="main-content" tabIndex={-1}>
      <h1>{title}</h1>
      <p>Маршрут подключён. Содержимое появится на следующем этапе.</p>
    </main>
  );
}
