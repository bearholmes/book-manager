import { mkdirSync, writeFileSync } from 'node:fs';
// Browser development only. Packaged apps use Electrobun RPC and never start this server.
import { join } from 'node:path';
import { DesktopService } from './application/command-service';
import { openLibrary } from './application/open-library';
import { BookLookupService } from './book-lookup/service';
import { CodexSettingsFile } from './platform/codex-settings';

const token = process.env.LOCAL_API_TOKEN;
if (!token) throw new Error('LOCAL_API_TOKEN is required');
const directory = process.env.BOOK_MANAGER_DATA_DIR ?? join(process.cwd(), '.local-data');
const testKey = process.env.BOOK_MANAGER_TEST_KEY;
const library = await openLibrary(
  directory,
  testKey ? async () => Buffer.from(testKey, 'hex') : undefined,
);
const lookup = new BookLookupService({
  settings: new CodexSettingsFile(join(directory, 'codex-settings.json')),
  openUrl: () => {
    throw new Error('외부 출처 열기는 네이티브 앱에서 사용해주세요.');
  },
});
const service = new DesktopService(
  library,
  async (content, extension) => {
    const exportsDir = join(directory, 'exports');
    mkdirSync(exportsDir, { recursive: true });
    const path = join(exportsDir, `books-${crypto.randomUUID()}.${extension}`);
    writeFileSync(path, content, { flag: 'wx', mode: 0o600 });
    return path;
  },
  lookup,
);

const origin = `http://127.0.0.1:${process.env.BOOK_MANAGER_DEV_PORT ?? '3000'}`;
const headers = {
  'Access-Control-Allow-Origin': origin,
  'Access-Control-Allow-Headers': 'Content-Type, X-Local-Token',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const server = Bun.serve({
  hostname: '127.0.0.1',
  port: Number(process.env.BOOK_MANAGER_API_PORT ?? 3101),
  maxRequestBodySize: 40 * 1024 * 1024,
  async fetch(request) {
    if (request.headers.get('origin') !== origin) return new Response('Forbidden', { status: 403 });
    if (request.method === 'OPTIONS') return new Response(null, { headers });
    if (
      request.method !== 'POST' ||
      new URL(request.url).pathname !== '/rpc' ||
      request.headers.get('x-local-token') !== token
    ) {
      return new Response('Forbidden', { status: 403, headers });
    }
    try {
      return Response.json(await service.execute(await request.json()), { headers });
    } catch {
      return Response.json({ ok: false, error: '잘못된 요청입니다.' }, { status: 400, headers });
    }
  },
});
console.log(`Local SQLite development bridge: ${server.url}`);
process.on('SIGTERM', () => {
  lookup.dispose();
  server.stop();
  library.close();
  setTimeout(() => process.exit(0), 1200);
});
