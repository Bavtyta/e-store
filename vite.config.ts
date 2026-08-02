/// <reference types="vitest/config" />

import { rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath, URL } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import type { Plugin } from 'vite';

import { parseEnvironment } from './src/shared/config/parseEnvironment.ts';

const projectDirectory = fileURLToPath(new URL('.', import.meta.url));

function omitMswWorkerFromProduction(): Plugin {
  let outputDirectory = '';

  return {
    name: 'omit-msw-worker-from-production',
    apply: 'build',
    configResolved(config) {
      outputDirectory = resolve(config.root, config.build.outDir);
    },
    async closeBundle() {
      await rm(resolve(outputDirectory, 'mockServiceWorker.js'), {
        force: true,
      });
    },
  };
}

export default defineConfig(({ command, mode }) => {
  const isDevelopmentServer = command === 'serve' && mode !== 'production';

  if (command === 'build') {
    const buildEnvironment = loadEnv(mode, projectDirectory, 'VITE_');

    parseEnvironment(
      {
        VITE_ANALYTICS_ID: buildEnvironment.VITE_ANALYTICS_ID,
        VITE_API_BASE_URL: buildEnvironment.VITE_API_BASE_URL,
        VITE_APP_ENV: buildEnvironment.VITE_APP_ENV,
        VITE_ERROR_REPORTING_DSN: buildEnvironment.VITE_ERROR_REPORTING_DSN,
        VITE_MSW_ENABLED: buildEnvironment.VITE_MSW_ENABLED,
        VITE_PUBLIC_SITE_URL: buildEnvironment.VITE_PUBLIC_SITE_URL,
      },
      {
        isDevelopmentServer: false,
        isProductionBuild: true,
      },
    );
  }

  return {
    define: {
      __DEV_SERVER__: JSON.stringify(isDevelopmentServer),
    },
    plugins: [react(), omitMswWorkerFromProduction()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    test: {
      clearMocks: true,
      environment: 'jsdom',
      env: {
        VITE_ANALYTICS_ID: '',
        VITE_API_BASE_URL: '/api/v1',
        VITE_APP_ENV: 'test',
        VITE_ERROR_REPORTING_DSN: '',
        VITE_MSW_ENABLED: 'false',
        VITE_PUBLIC_SITE_URL: 'http://localhost:4173',
      },
      globals: true,
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
      restoreMocks: true,
      setupFiles: ['./src/shared/lib/testing/setupTests.ts'],
    },
  };
});
