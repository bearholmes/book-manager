import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';

const token = randomBytes(32).toString('hex');
const port = process.env.BOOK_MANAGER_DEV_PORT ?? '3000';
const apiPort = process.env.BOOK_MANAGER_API_PORT ?? '3101';
const bun = process.platform === 'win32' ? 'bun.exe' : 'bun';
const environment = {
  ...process.env,
  LOCAL_API_TOKEN: token,
  VITE_LOCAL_API_TOKEN: token,
  VITE_LOCAL_API_URL: `http://127.0.0.1:${apiPort}/rpc`,
};
const backend = spawn(bun, ['desktop/dev-server.ts'], { env: environment, stdio: 'inherit' });
const frontend = spawn(
  process.execPath,
  [
    'node_modules/vite/bin/vite.js',
    '--config',
    'tooling/config/vite.config.ts',
    '--host',
    '127.0.0.1',
    '--port',
    port,
    '--strictPort',
  ],
  { env: environment, stdio: 'inherit' },
);
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  backend.kill('SIGTERM');
  frontend.kill('SIGTERM');
  process.exitCode = code;
}
for (const child of [backend, frontend]) {
  child.on('error', (error) => {
    console.error(error.message);
    stop(1);
  });
  child.on('exit', (code) => stop(code ?? 0));
}
process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());
