import styles from './placeholder.module.css';

interface PlaceholderProps {
  title: string;
}

export function Placeholder({ title }: PlaceholderProps) {
  return (
    <section className={styles.root}>
      <h1>{title}</h1>
      <p>Маршрут подключён. Содержимое появится на следующем этапе.</p>
    </section>
  );
}
