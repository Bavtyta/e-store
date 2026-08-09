/// <reference types="vitest/config" />

import { mkdir, rm, writeFile } from 'node:fs/promises';
import type { ServerResponse } from 'node:http';
import { resolve } from 'node:path';
import { fileURLToPath, URL } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import type { Plugin } from 'vite';

import { createRobotsTxt, createSitemapXml, resolveSiteOrigin } from './scripts/seo-assets.ts';
import { parseEnvironment } from './src/shared/config/parseEnvironment.ts';

const projectDirectory = fileURLToPath(new URL('.', import.meta.url));

function createSeoAssetsPlugin(siteUrl: string): Plugin {
  let isBuild = false;
  let outputDirectory = '';
  const siteOrigin = resolveSiteOrigin(siteUrl);

  function respondWithAsset(response: ServerResponse, contentType: string, body: string) {
    response.statusCode = 200;
    response.setHeader('Content-Type', contentType);
    response.end(body);
  }

  return {
    name: 'generate-seo-assets',
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const pathname = request.url?.split('?')[0];

        if (pathname === '/robots.txt') {
          respondWithAsset(response, 'text/plain; charset=utf-8', createRobotsTxt(siteOrigin));
          return;
        }

        if (pathname === '/sitemap.xml') {
          respondWithAsset(response, 'application/xml; charset=utf-8', createSitemapXml(siteOrigin));
          return;
        }

        next();
      });
    },
    configResolved(config) {
      isBuild = config.command === 'build';
      outputDirectory = resolve(config.root, config.build.outDir);
    },
    async closeBundle() {
      if (!isBuild) {
        return;
      }

      await mkdir(outputDirectory, { recursive: true });
      await Promise.all([
        writeFile(resolve(outputDirectory, 'robots.txt'), createRobotsTxt(siteOrigin), 'utf8'),
        writeFile(resolve(outputDirectory, 'sitemap.xml'), createSitemapXml(siteOrigin), 'utf8'),
      ]);
    },
  };
}

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
  const env = loadEnv(mode, projectDirectory, 'VITE_');
  const publicSiteUrl = process.env.VITE_PUBLIC_SITE_URL ?? env.VITE_PUBLIC_SITE_URL ?? 'http://localhost:5173';
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
    plugins: [react(), createSeoAssetsPlugin(publicSiteUrl), omitMswWorkerFromProduction()],
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
