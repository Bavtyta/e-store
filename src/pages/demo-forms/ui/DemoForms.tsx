import { useState } from 'react';
import type { SyntheticEvent } from 'react';
import { Link } from 'react-router';

import { appConfig } from '@/shared/config';
import { createPageMetadata, PageMetadata } from '@/shared/lib';
import { Button, Container, Input } from '@/shared/ui';

import styles from './demo-forms.module.css';

function DemoNotice() {
  return (
    <p className={styles.notice}>
      Демонстрационный режим: введённые данные никуда не отправляются и не сохраняются.
    </p>
  );
}

export function LoginPage() {
  const [isComplete, setIsComplete] = useState(false);
  const metadata = createPageMetadata(
    {
      canonicalPath: '/login',
      description: 'Демонстрационный вход в профиль BELT.',
      indexable: false,
      title: 'Вход в профиль',
    },
    appConfig.publicSiteUrl,
  );

  function handleSubmit(event: SyntheticEvent<HTMLFormElement, SubmitEvent>) {
    event.preventDefault();
    setIsComplete(true);
  }

  return (
    <Container className={styles.page}>
      <PageMetadata metadata={metadata} />
      <div className={styles.panel}>
        <p className={styles.eyebrow}>Профиль покупателя</p>
        <h1>Вход</h1>
        <p className={styles.lead}>
          Авторизация появится после подключения backend. Сейчас экран показывает будущий сценарий.
        </p>
        <DemoNotice />
        {isComplete ? (
          <div className={styles.success} role="status">
            <h2>Форма работает в деморежиме</h2>
            <p>Аккаунт не создан, данные не сохранены.</p>
            <Link to="/catalog">Вернуться в каталог</Link>
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            <Input autoComplete="email" label="Email или телефон" required />
            <Input autoComplete="current-password" label="Пароль" required type="password" />
            <Button type="submit">Продолжить</Button>
          </form>
        )}
      </div>
    </Container>
  );
}

interface SelectionErrors {
  contact?: string;
  name?: string;
  task?: string;
}

function getTextValue(form: FormData, name: string): string {
  const value = form.get(name);

  return typeof value === 'string' ? value.trim() : '';
}

export function SelectionHelpPage() {
  const [errors, setErrors] = useState<SelectionErrors>({});
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const metadata = createPageMetadata(
    {
      canonicalPath: '/selection-help',
      description: 'Демонстрационная форма помощи с подбором материалов.',
      indexable: false,
      title: 'Помощь с подбором',
    },
    appConfig.publicSiteUrl,
  );

  function handleSubmit(event: SyntheticEvent<HTMLFormElement, SubmitEvent>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const nextErrors: SelectionErrors = {};
    if (getTextValue(form, 'name').length < 2) nextErrors.name = 'Укажите имя.';
    if (getTextValue(form, 'contact').length < 5)
      nextErrors.contact = 'Укажите телефон, email или мессенджер.';
    if (getTextValue(form, 'task').length < 10)
      nextErrors.task = 'Опишите задачу хотя бы в нескольких словах.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setStatus('loading');
    window.setTimeout(() => {
      setStatus('success');
    }, 600);
  }

  return (
    <Container className={styles.page}>
      <PageMetadata metadata={metadata} />
      <div className={styles.panel}>
        <p className={styles.eyebrow}>Консультация по ассортименту</p>
        <h1>Помощь с подбором</h1>
        <p className={styles.lead}>
          Опишите задачу и исходные параметры. Позже этот запрос сможет получить менеджер.
        </p>
        <DemoNotice />
        {status === 'success' ? (
          <div className={styles.success} role="status">
            <h2>Демонстрационный запрос обработан</h2>
            <p>В реальной версии здесь появятся номер обращения и выбранный канал связи.</p>
            <Link to="/catalog">Продолжить выбор в каталоге</Link>
          </div>
        ) : (
          <form className={styles.form} noValidate onSubmit={handleSubmit}>
            <div className={styles.twoColumns}>
              <Input
                {...(errors.name === undefined ? {} : { error: errors.name })}
                label="Имя"
                name="name"
                required
              />
              <Input
                {...(errors.contact === undefined ? {} : { error: errors.contact })}
                hint="Телефон, email или мессенджер"
                label="Как с вами связаться"
                name="contact"
                required
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="selection-task">Задача *</label>
              <textarea
                aria-describedby={errors.task ? 'selection-task-error' : undefined}
                aria-invalid={errors.task ? true : undefined}
                id="selection-task"
                name="task"
                rows={5}
              />
              {errors.task ? (
                <p id="selection-task-error" role="alert">
                  {errors.task}
                </p>
              ) : null}
            </div>
            <div className={styles.twoColumns}>
              <Input label="Материал" name="material" />
              <Input label="Диаметр или размер" name="diameter" />
            </div>
            <Input label="Условия применения" name="application" />
            <Button disabled={status === 'loading'} type="submit">
              {status === 'loading' ? 'Проверяем форму…' : 'Проверить демонстрационный запрос'}
            </Button>
          </form>
        )}
      </div>
    </Container>
  );
}
