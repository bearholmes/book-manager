import { expect, test } from 'bun:test';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runProcess } from './codex';

test.skipIf(process.platform === 'win32')(
  'cancellation kills descendants after the leader exits',
  async () => {
    const directory = await mkdtemp(join(tmpdir(), 'lookup-cancel-test-'));
    const pidFile = join(directory, 'child.pid');
    const controller = new AbortController();
    // Both use the test runtime; the descendant intentionally ignores graceful termination.
    const descendant = `process.on('SIGTERM', () => {}); await Bun.write(${JSON.stringify(pidFile)}, String(process.pid)); setInterval(() => {}, 1000);`;
    const parent = `const {spawn}=require('node:child_process'); spawn(process.execPath, ['-e', ${JSON.stringify(descendant)}], {stdio:'ignore'}); setInterval(() => {},1000);`;
    const running = runProcess(process.execPath, ['-e', parent], '', controller.signal, 5000).catch(
      (error: Error) => error.message,
    );
    let pid = 0;
    try {
      for (let i = 0; i < 100; i++) {
        try {
          pid = Number(await readFile(pidFile, 'utf8'));
        } catch {
          /* Wait for child readiness. */
        }
        if (pid) break;
        await Bun.sleep(20);
      }
      expect(pid).toBeGreaterThan(0);
      controller.abort();
      expect(await running).toBe('조사를 취소했습니다.');
      let alive = true;
      for (let i = 0; i < 50 && alive; i++) {
        try {
          process.kill(pid, 0);
        } catch {
          alive = false;
        }
        if (alive) await Bun.sleep(20);
      }
      expect(alive).toBe(false);
    } finally {
      controller.abort();
      await running;
      if (pid) {
        try {
          process.kill(pid, 'SIGKILL');
        } catch {
          /* Already exited. */
        }
      }
      await rm(directory, { recursive: true, force: true });
    }
  },
  10000,
);
