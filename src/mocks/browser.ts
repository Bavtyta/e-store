import { setupWorker } from 'msw/browser';

import { handlers } from './handlers';

const worker = setupWorker(...handlers);

export async function startMockWorker(): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    throw new Error('В текущем браузере недоступен Service Worker для локальных mock-данных.');
  }

  await worker.start({
    onUnhandledRequest: 'error',
    quiet: true,
    serviceWorker: {
      options: {
        scope: '/',
      },
      url: '/mockServiceWorker.js',
    },
  });
}
