import { Database } from 'bun:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

export function acquireStoreGuard(path: string): Database {
  mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
  const guard = new Database(`${path}.guard`);
  try {
    guard.exec(
      'PRAGMA busy_timeout = 0; CREATE TABLE IF NOT EXISTS guard(id INTEGER); BEGIN EXCLUSIVE;',
    );
    return guard;
  } catch {
    guard.close();
    throw new Error(
      '이 서재를 사용하는 앱이 이미 실행 중입니다. 다른 창을 종료한 뒤 다시 시도해주세요.',
    );
  }
}
