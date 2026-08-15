import { defineConfig, devices } from '@playwright/test';

const baseUrl = 'http://127.0.0.1:4173';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: baseUrl,
    trace: 'on-first-retry',
    actionTimeout: 15_000,
  },
  expect: {
    timeout: 15_000,
  },
  timeout: 60_000,
  projects: [
    {
      name: 'chromium',
      use: devices['Desktop Chrome'],
    },
  ],
});
