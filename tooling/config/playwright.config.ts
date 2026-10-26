import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
/// <reference types="node" />
import { defineConfig, devices } from '@playwright/test';

const projectRoot = fileURLToPath(new URL('../..', import.meta.url));

/**
 * Playwright E2E 테스트 설정
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: join(projectRoot, 'tests/e2e'),
  outputDir: join(projectRoot, 'build/reports/e2e/results'),
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // Each scenario owns a separate library; one worker keeps native test startup lightweight.
  workers: 1,
  reporter: [
    ['html', { outputFolder: join(projectRoot, 'build/reports/e2e/html'), open: 'never' }],
  ],

  use: {
    baseURL: 'http://127.0.0.1:4310',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  /* 프로젝트 설정 */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    /* 추가 브라우저가 필요한 경우 주석 해제
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    */
  ],

  /* 개발 서버 자동 실행 */
  webServer: {
    command:
      'pnpm exec vite --config tooling/config/vite.config.ts --host 127.0.0.1 --port 4310 --strictPort',
    cwd: projectRoot,
    // Browser RPC is forwarded by each scenario's fixture to its own authenticated backend.
    env: {
      VITE_LOCAL_API_TOKEN: 'isolated-e2e-transport',
      VITE_LOCAL_API_URL: 'http://127.0.0.1:4311/rpc',
    },
    url: 'http://127.0.0.1:4310',
    reuseExistingServer: false,
    timeout: 120000,
  },
});
