import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test as base, expect } from '@playwright/test';

/** Each test (including retries) gets its own process, key, library and export directory. */
export const test = base.extend({
  page: async ({ page }, use) => {
    const directory = await mkdtemp(join(tmpdir(), 'reading-desk-scenario-'));
    const token = randomBytes(32).toString('hex');
    const backend = spawn(join(process.cwd(), 'node_modules/.bin/bun'), ['desktop/dev-server.ts'], {
      env: {
        ...process.env,
        BOOK_MANAGER_DATA_DIR: directory,
        BOOK_MANAGER_TEST_KEY: randomBytes(32).toString('hex'),
        BOOK_MANAGER_DEV_PORT: '4310',
        BOOK_MANAGER_API_PORT: '0',
        LOCAL_API_TOKEN: token,
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const exited = new Promise<void>((resolve) => {
      backend.once('exit', () => resolve());
      backend.once('error', () => resolve());
    });
    try {
      const url = await new Promise<string>((resolve, reject) => {
        let output = '';
        const timeout = setTimeout(
          () => reject(new Error('Isolated library startup timed out')),
          10000,
        );
        const fail = () => {
          clearTimeout(timeout);
          reject(new Error('Isolated library failed to start'));
        };
        backend.once('error', fail);
        backend.once('exit', fail);
        backend.stderr.resume();
        backend.stdout.on('data', (chunk) => {
          output = `${output}${chunk}`.slice(-8192);
          const match = output.match(
            /Local SQLite development bridge: (http:\/\/127\.0\.0\.1:\d+\/)/,
          );
          if (!match?.[1]) return;
          clearTimeout(timeout);
          resolve(match[1]);
        });
      });
      await page.route('**/rpc', async (route) => {
        const response = await route.fetch({
          url: `${url}rpc`,
          headers: { ...route.request().headers(), 'x-local-token': token },
          timeout: 120000,
        });
        await route.fulfill({ response });
      });
      await use(page);
    } finally {
      try {
        await page.unrouteAll({ behavior: 'ignoreErrors' });
      } finally {
        backend.kill('SIGTERM');
        const timeout = setTimeout(() => backend.kill('SIGKILL'), 5000);
        await exited;
        clearTimeout(timeout);
        await rm(directory, { recursive: true, force: true });
      }
    }
  },
});

export { expect };
