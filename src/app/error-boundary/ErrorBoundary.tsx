import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

import { appConfig } from '@/shared/config';
import { createPageMetadata, PageMetadata } from '@/shared/lib';
import type { UnexpectedErrorReporter } from '@/shared/lib';

import { appObservability } from '../observability';
import styles from './error-boundary.module.css';

interface ErrorBoundaryProps {
  children: ReactNode;
  observability?: UnexpectedErrorReporter;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

const initialState: ErrorBoundaryState = {
  hasError: false,
};

const errorMetadata = createPageMetadata(
  {
    canonicalPath: '/',
    description: 'Не удалось отобразить запрошенную страницу.',
    indexable: false,
    title: 'Ошибка отображения страницы',
  },
  appConfig.publicSiteUrl,
);

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state = initialState;

  static getDerivedStateFromError(): ErrorBoundaryState {
    return {
      hasError: true,
    };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    (this.props.observability ?? appObservability).reportUnexpectedError(error, {
      componentStack: info.componentStack,
      source: 'react-error-boundary',
    });
  }

  private readonly handleReload = (): void => {
    window.location.reload();
  };

  override render() {
    if (this.state.hasError) {
      return (
        <>
          <PageMetadata metadata={errorMetadata} />
          <main className={styles.root} id="main-content" tabIndex={-1}>
            <h1>Не удалось отобразить страницу</h1>
            <p>Обновите страницу и попробуйте ещё раз.</p>
            <div className={styles.actions}>
              <button type="button" onClick={this.handleReload}>
                Обновить страницу
              </button>
              <a href="/">Перейти на главную</a>
            </div>
          </main>
        </>
      );
    }

    return this.props.children;
  }
}
