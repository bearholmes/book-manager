import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import appConfig from './vite.config.ts';

const projectRoot = fileURLToPath(new URL('../..', import.meta.url));

export default defineConfig({
  ...appConfig,
  root: projectRoot,
  test: {
    globals: true,
    environment: 'jsdom',
    // Node 25+ Web Storage shadows jsdom's isolated browser storage in Vitest.
    execArgv: ['--no-webstorage'],
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reportsDirectory: path.join(projectRoot, 'build/reports/coverage'),
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        '**/*.stories.tsx',
      ],
    },
  },
});
