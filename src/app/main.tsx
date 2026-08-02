import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { isMswEnabled } from '@/shared/config';

import { App } from './App';
import { createAppQueryClient } from './providers';
import { createAppRouter } from './router';
import './styles/global.css';

async function startDevelopmentMocks(): Promise<void> {
  if (!__DEV_SERVER__ || !isMswEnabled) {
    return;
  }

  const { startMockWorker } = await import('@/mocks');
  await startMockWorker();
}

async function bootstrap(): Promise<void> {
  await startDevelopmentMocks();

  const rootElement = document.getElementById('root');

  if (rootElement === null) {
    throw new Error('Не найден корневой элемент приложения.');
  }

  const queryClient = createAppQueryClient();
  const router = createAppRouter();

  createRoot(rootElement).render(
    <StrictMode>
      <App queryClient={queryClient} router={router} />
    </StrictMode>,
  );
}

void bootstrap();
