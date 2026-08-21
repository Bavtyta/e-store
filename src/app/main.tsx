import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { isMswEnabled } from '@/shared/config';

import { App } from './App';
import { BootstrapError } from './bootstrap/BootstrapError';
import { createAppQueryClient } from './providers';
import { createAppRouter } from './router';
import './styles/global.css';

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Неизвестная ошибка запуска.';
}

function renderBootstrapError(rootElement: HTMLElement, error: unknown): void {
  createRoot(rootElement).render(<BootstrapError message={getErrorMessage(error)} />);
}

async function startDevelopmentMocks(): Promise<void> {
  if (!__DEV_SERVER__ || !isMswEnabled) {
    return;
  }

  const { startMockWorker } = await import('@/mocks');
  await startMockWorker();
}

async function bootstrap(): Promise<void> {
  const rootElement = document.getElementById('root');

  if (rootElement === null) {
    throw new Error('Не найден корневой элемент приложения.');
  }

  try {
    await startDevelopmentMocks();
  } catch (error) {
    renderBootstrapError(rootElement, error);
    return;
  }

  const queryClient = createAppQueryClient();
  const router = createAppRouter();

  createRoot(rootElement).render(
    <StrictMode>
      <App queryClient={queryClient} router={router} />
    </StrictMode>,
  );
}

void bootstrap().catch((error: unknown) => {
  const rootElement = document.getElementById('root');

  if (rootElement === null) {
    return;
  }

  renderBootstrapError(rootElement, error);
});
