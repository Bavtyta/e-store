import { useState } from 'react';

import { appConfig } from '@/shared/config';
import { classNames, createPageMetadata, PageMetadata } from '@/shared/lib';
import {
  Badge,
  Button,
  Card,
  Container,
  Dialog,
  EmptyState,
  ErrorState,
  IconButton,
  ImagePlaceholder,
  Input,
  NumberInput,
  Skeleton,
  Toast,
} from '@/shared/ui';

import styles from './ui-preview-page.module.css';

const colorSamples = [
  { className: styles.accent, label: 'Акцент' },
  { className: styles.dark, label: 'Тёмная поверхность' },
  { className: styles.background, label: 'Основной фон' },
  { className: styles.surface, label: 'Карточка' },
  { className: styles.success, label: 'Успех' },
  { className: styles.error, label: 'Ошибка' },
] as const;

const previewMetadata = createPageMetadata(
  {
    canonicalPath: '/ui-preview',
    description: 'Техническая страница предварительного просмотра дизайн-системы.',
    indexable: false,
    title: 'UI Preview',
  },
  appConfig.publicSiteUrl,
);

export function UiPreviewPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isToastVisible, setIsToastVisible] = useState(true);

  return (
    <>
      <PageMetadata metadata={previewMetadata} />
      <main className={styles.page} id="main-content" tabIndex={-1}>
        <Container>
          <section className={styles.hero}>
            <p className={styles.eyebrow}>Development only</p>
            <h1>UI Preview</h1>
            <p>
              Техническая страница для ручной проверки токенов, состояний и доступности базовых
              компонентов.
            </p>
          </section>

          <div className={styles.sections}>
            <section aria-labelledby="preview-colors" className={styles.section}>
              <div className={styles.sectionHeading}>
                <h2 id="preview-colors">Цвета и типографика</h2>
                <p>Основная палитра и шкала текста из дизайн-токенов.</p>
              </div>
              <div className={styles.colorGrid}>
                {colorSamples.map((sample) => (
                  <div className={styles.colorSample} key={sample.label}>
                    <span
                      aria-hidden="true"
                      className={classNames(styles.swatch, sample.className)}
                    />
                    <span>{sample.label}</span>
                  </div>
                ))}
              </div>
              <Card className={styles.typeSample}>
                <p className={styles.typeLarge}>Заголовок интерфейса</p>
                <p>Основной текст для спокойного чтения.</p>
                <p className={styles.secondaryText}>Вторичный текст и пояснения.</p>
              </Card>
            </section>

            <section aria-labelledby="preview-buttons" className={styles.section}>
              <div className={styles.sectionHeading}>
                <h2 id="preview-buttons">Кнопки и бейджи</h2>
                <p>Основные, вторичные, опасные и недоступные состояния.</p>
              </div>
              <Card>
                <div className={styles.row}>
                  <Button>Основная</Button>
                  <Button variant="secondary">Вторичная</Button>
                  <Button variant="danger">Опасное действие</Button>
                  <Button disabled>Недоступна</Button>
                  <Button isLoading>Загрузка</Button>
                </div>
                <div className={styles.row}>
                  <IconButton label="Добавить">+</IconButton>
                  <IconButton label="Закрыть" variant="ghost">
                    ×
                  </IconButton>
                  <IconButton disabled label="Недоступное действие">
                    ?
                  </IconButton>
                  <Badge>Нейтрально</Badge>
                  <Badge tone="success">Успешно</Badge>
                  <Badge tone="warning">Внимание</Badge>
                  <Badge tone="error">Ошибка</Badge>
                </div>
              </Card>
            </section>

            <section aria-labelledby="preview-fields" className={styles.section}>
              <div className={styles.sectionHeading}>
                <h2 id="preview-fields">Поля</h2>
                <p>Связанные labels, подсказки, ошибки и disabled-состояния.</p>
              </div>
              <div className={styles.fieldGrid}>
                <Input
                  hint="Нейтральная подсказка для поля."
                  label="Текстовое поле"
                  placeholder="Введите значение"
                />
                <Input
                  error="Проверьте введённое значение."
                  label="Поле с ошибкой"
                  placeholder="Некорректное значение"
                  required
                />
                <Input disabled label="Недоступное поле" value="Изменение запрещено" />
                <NumberInput defaultValue="3.5" label="Числовое поле" min="0" step="0.5" />
              </div>
            </section>

            <section aria-labelledby="preview-surfaces" className={styles.section}>
              <div className={styles.sectionHeading}>
                <h2 id="preview-surfaces">Поверхности и загрузка</h2>
                <p>Карточки, заглушка изображения и skeleton разных форм.</p>
              </div>
              <div className={styles.surfaceGrid}>
                <Card>
                  <h3>Outlined Card</h3>
                  <p>Нейтральная поверхность с границей.</p>
                </Card>
                <Card variant="elevated">
                  <h3>Elevated Card</h3>
                  <p>Поверхность с мягкой тенью.</p>
                </Card>
                <ImagePlaceholder alt="Изображение недоступно" />
                <Card className={styles.skeletonGroup}>
                  <Skeleton label="Загрузка аватара" variant="circle" />
                  <Skeleton label="Загрузка заголовка" width="70%" />
                  <Skeleton label="Загрузка строки" />
                  <Skeleton height="5rem" label="Загрузка блока" variant="rectangle" />
                </Card>
              </div>
            </section>

            <section aria-labelledby="preview-feedback" className={styles.section}>
              <div className={styles.sectionHeading}>
                <h2 id="preview-feedback">Состояния и уведомления</h2>
                <p>Пустой результат, ошибка, toast и диалог.</p>
              </div>
              <div className={styles.stateGrid}>
                <EmptyState
                  action={<Button variant="secondary">Обновить</Button>}
                  description="Здесь пока нет данных для отображения."
                  title="Ничего не найдено"
                />
                <ErrorState
                  description="Повторите действие через некоторое время."
                  onRetry={() => {
                    setIsToastVisible(true);
                  }}
                  title="Не удалось выполнить запрос"
                />
              </div>
              <Card className={styles.feedbackControls}>
                <div className={styles.row}>
                  <Button
                    onClick={() => {
                      setIsDialogOpen(true);
                    }}
                  >
                    Открыть диалог
                  </Button>
                  <Button
                    onClick={() => {
                      setIsToastVisible(true);
                    }}
                    variant="secondary"
                  >
                    Показать toast
                  </Button>
                </div>
                {isToastVisible ? (
                  <Toast
                    message="Короткое нейтральное уведомление."
                    onDismiss={() => {
                      setIsToastVisible(false);
                    }}
                    title="Готово"
                    tone="success"
                  />
                ) : null}
              </Card>
            </section>
          </div>
        </Container>

        <Dialog
          description="Tab остаётся внутри диалога, Escape закрывает его."
          footer={
            <>
              <Button
                onClick={() => {
                  setIsDialogOpen(false);
                }}
                variant="secondary"
              >
                Отмена
              </Button>
              <Button
                onClick={() => {
                  setIsDialogOpen(false);
                }}
              >
                Подтвердить
              </Button>
            </>
          }
          onClose={() => {
            setIsDialogOpen(false);
          }}
          open={isDialogOpen}
          title="Проверка диалога"
        >
          <p className={styles.dialogCopy}>
            После закрытия фокус вернётся на кнопку, которая открыла этот диалог.
          </p>
        </Dialog>
      </main>
    </>
  );
}
