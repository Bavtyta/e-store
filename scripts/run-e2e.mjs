import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { createServer } from 'vite';

const HOST = '127.0.0.1';
const PORT = 4173;

const testEnvironment = {
  ...process.env,
  VITE_ANALYTICS_ID: '',
  VITE_API_BASE_URL: '/api/v1',
  VITE_APP_ENV: 'test',
  VITE_ERROR_REPORTING_DSN: '',
  VITE_MSW_ENABLED: 'true',
  VITE_PUBLIC_SITE_URL: 'http://127.0.0.1:4173',
};

Object.assign(process.env, testEnvironment);

const playwrightCliPath = fileURLToPath(
  new URL('../node_modules/@playwright/test/cli.js', import.meta.url),
);

function runPlaywright() {
  return new Promise((resolve, reject) => {
    const processHandle = spawn(
      process.execPath,
      [playwrightCliPath, 'test', ...process.argv.slice(2)],
      {
        env: testEnvironment,
        stdio: 'inherit',
      },
    );

    processHandle.once('error', reject);
    processHandle.once('exit', (exitCode, signal) => {
      if (signal !== null) {
        reject(new Error(`Playwright завершился по сигналу ${signal}.`));
        return;
      }

      resolve(exitCode ?? 1);
    });
  });
}

async function runE2e() {
  const viteServer = await createServer({
    logLevel: 'error',
    mode: 'test',
    server: {
      host: HOST,
      port: PORT,
      strictPort: true,
    },
  });

  try {
    await viteServer.listen();
    return await runPlaywright();
  } finally {
    await viteServer.close();
  }
}

process.exitCode = await runE2e();
